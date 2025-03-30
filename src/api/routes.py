# api/routes.py

from flask import request, jsonify, Blueprint, Response, Flask
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash, generate_password_hash
from flask_cors import CORS
import os
import subprocess
import requests
import json
import uuid
import stripe



# from api import api
from api.models import db, Avatar, Customization, RiggedAvatar, User, UserUsage, MotionCaptureSession, MotionAudioSync
from .utils.deep3d_api import send_to_deep3d, send_to_real_deep3d  # Ensure this exists and returns a valid URL
from .utils.process_pose_video import process_and_save_pose
from .utils.rigging import external_rigging_tool
from .utils.skeleton_builder import create_default_skeleton
from datetime import datetime






import tempfile
import librosa
import cv2
import mediapipe as mp
import numpy as np
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file
from .utils.process_pose_video import process_and_save_pose




api = Blueprint('api', __name__)
app = Flask(__name__)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Define Stripe prices (replace with your real Stripe Price IDs)
STRIPE_PRICE_IDS = {
    "Basic": "price_123_basic",
    "Pro": "price_456_pro",
    "Premium": "price_789_premium"
}



# MediaPipe setup
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()


UPLOAD_FOLDER = os.path.join("static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Your Deep3D API Key (make sure to set this in your environment or replace it here)
DEEP3D_API_URL = "https://api.deep3d.com/generate-avatar"  # Replace with the actual URL
DEEP3D_API_KEY = os.getenv("DEEP3D_API_KEY")  # Ensure to have the API key securely stored


# Enable CORS
CORS(api)

# 🔐 Plan-based rigging limits
PLAN_LIMITS = {
    "Basic": 5,
    "Pro": 20,
    "Premium": float("inf")  # unlimited rigging
}

@api.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    # Check if user already exists
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "User already exists"}), 409

    hashed_password = generate_password_hash(password)

    new_user = User(
        username=username,
        email=email,
        password_hash=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Mock token (for now). Later, generate a JWT or session token.
    token = str(uuid.uuid4())

    return jsonify({
        "message": "Login successful",
        "user_id": user.id,
        "username": user.username,
        "token": token
    }), 200


@api.route("/create-avatar", methods=["POST"])
def create_avatar():
    image = request.files.get("image")
    user_id = request.form.get("user_id")

    if not image or not user_id:
        return jsonify({"error": "Missing image or user ID"}), 400

    filename = secure_filename(image.filename)
    filepath = os.path.join("temp_uploads", filename)
    image.save(filepath)

    avatar_url = send_to_deep3d(filepath)

    avatar = Avatar(user_id=user_id, avatar_url=avatar_url, filename=filename)
    db.session.add(avatar)
    db.session.commit()

    return jsonify({"avatar_url": avatar_url}), 200


@api.route("/save-avatar", methods=["POST"])
def save_avatar():
    data = request.json
    avatar_id = data.get("avatar_id")
    customization_data = data.get("customization")

    if not avatar_id or not customization_data:
        return jsonify({"error": "Missing data"}), 400

    existing = Customization.query.filter_by(avatar_id=avatar_id).first()
    if existing:
        existing.skin_color = customization_data.get("skin_color")
        existing.outfit_color = customization_data.get("outfit_color")
        existing.accessories = customization_data.get("accessories")
    else:
        new_custom = Customization(
            avatar_id=avatar_id,
            skin_color=customization_data.get("skin_color"),
            outfit_color=customization_data.get("outfit_color"),
            accessories=customization_data.get("accessories")
        )
        db.session.add(new_custom)

    db.session.commit()
    return jsonify({"message": "Customization saved"}), 200


@api.route("/delete-avatar/<int:avatar_id>", methods=["DELETE"])
def delete_avatar(avatar_id):
    avatar = Avatar.query.get(avatar_id)
    if not avatar:
        return jsonify({"error": "Avatar not found"}), 404

    db.session.delete(avatar)
    db.session.commit()
    return jsonify({"message": "Avatar deleted"}), 200


@api.route("/get-avatar/<int:user_id>", methods=["GET"])

def get_avatar(user_id):
    avatar = Avatar.query.filter_by(user_id=user_id).order_by(Avatar.created_at.desc()).first()
    if not avatar:
        return jsonify({"error": "No avatar found"}), 404

    customization = Customization.query.filter_by(avatar_id=avatar.id).first()
    return jsonify({
        "avatar_url": avatar.avatar_url,
        "customization": {
            "skin_color": customization.skin_color if customization else None,
            "outfit_color": customization.outfit_color if customization else None,
            "accessories": customization.accessories if customization else None
        }
    }), 200

@api.route('/analyze-beats', methods=['POST'])
def analyze_beats():
    file = request.files.get("audio")
    if not file:
        return jsonify({"error": "No audio file provided"}), 400

    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file.save(temp_file.name)
        y, sr = librosa.load(temp_file.name)
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        beat_times = librosa.frames_to_time(beat_frames, sr=sr).tolist()

    return jsonify({"tempo": tempo, "beat_times": beat_times}), 200

@api.route("/analyze-voice", methods=["POST"])
def analyze_voice():
    audio = request.files.get("audio")
    if not audio:
        return jsonify({"error": "No audio uploaded"}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        audio.save(temp_file.name)
        y, sr = librosa.load(temp_file.name)
        duration = librosa.get_duration(y=y, sr=sr)

        # Mock result: simulate timing of words/phonemes
        mock_visemes = [
            {"time": 0.0, "viseme": "A"},
            {"time": 0.3, "viseme": "E"},
            {"time": 0.5, "viseme": "O"},
            {"time": 0.8, "viseme": "M"}
        ]

        return jsonify({
            "duration": duration,
            "visemes": mock_visemes
        }), 200

# Define the route to convert to MP4
@api.route("/convert-to-mp4", methods=["POST"])
def convert_to_mp4():
    video_file = request.json.get("filename")
    if not video_file:
        return jsonify({"error": "Missing filename"}), 400

    video_path = os.path.join(UPLOAD_FOLDER, video_file)
    mp4_filename = video_file.replace(".webm", ".mp4")
    mp4_path = os.path.join(UPLOAD_FOLDER, mp4_filename)

    command = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",  # adjust for quality
        mp4_path
    ]

    try:
        subprocess.run(command, check=True)
        return jsonify({"mp4_url": f"/static/uploads/{mp4_filename}"}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"error": str(e)}), 500


# Define the route to convert to AVI
@api.route("/convert-to-avi", methods=["POST"])
def convert_to_avi():
    video_file = request.json.get("filename")
    if not video_file:
        return jsonify({"error": "Missing filename"}), 400

    video_path = os.path.join(UPLOAD_FOLDER, video_file)
    avi_filename = video_file.replace(".webm", ".avi")
    avi_path = os.path.join(UPLOAD_FOLDER, avi_filename)

    command = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",  # adjust for quality
        avi_path
    ]

    try:
        subprocess.run(command, check=True)
        return jsonify({"avi_url": f"/static/uploads/{avi_filename}"}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"error": str(e)}), 500


# Define the route to convert to MOV
@api.route("/convert-to-mov", methods=["POST"])
def convert_to_mov():
    video_file = request.json.get("filename")
    if not video_file:
        return jsonify({"error": "Missing filename"}), 400

    video_path = os.path.join(UPLOAD_FOLDER, video_file)
    mov_filename = video_file.replace(".webm", ".mov")
    mov_path = os.path.join(UPLOAD_FOLDER, mov_filename)

    command = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-c:v", "prores_ks",  # Apple ProRes codec for .mov format
        mov_path
    ]

    try:
        subprocess.run(command, check=True)
        return jsonify({"mov_url": f"/static/uploads/{mov_filename}"}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"error": str(e)}), 500


# Define the route using Blueprint
# Helper function to send selfie to Deep3D API
def send_to_deep3d(filepath):
    """
    Send the uploaded selfie to Deep3D API to generate the 3D avatar.
    """
    try:
        with open(filepath, 'rb') as image_file:
            files = {'image': image_file}
            headers = {"Authorization": f"Bearer {DEEP3D_API_KEY}"}
            response = requests.post(DEEP3D_API_URL, files=files, headers=headers)

        response.raise_for_status()  # Raise an error for bad responses

        # Parse the response and return the avatar URL
        data = response.json()
        avatar_url = data.get("avatar_url")  # Adjust based on actual API response
        return avatar_url

    except Exception as e:
        print(f"[Deep3D Error] {e}")
        return None

# Route to handle the selfie upload and 3D avatar creation
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@api.route('/upload-selfie', methods=['POST'])
def upload_selfie():
    image = request.files.get('image')  # Get the image from the request
    
    # Check if no image is uploaded
    if not image:
        return jsonify({"error": "No image uploaded"}), 400
    
    # Check if the file type is allowed
    if not allowed_file(image.filename):
        return jsonify({"error": "Invalid file type. Only image files are allowed."}), 400

    # Save the image file to the server
    filename = secure_filename(image.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    image.save(filepath)

    # Send the image to Deep3D and retrieve the avatar URL
    avatar_url = send_to_deep3d(filepath)

    if avatar_url:
        return jsonify({"avatar_url": avatar_url}), 200
    else:
        return jsonify({"error": "Avatar generation failed"}), 500

# Route to process pose data from frontend
@api.route('/process-pose', methods=['POST'])
def process_pose():
    # Assuming you have video frames or pose data from frontend
    pose_data = request.json.get('pose_data')

    # For now, let's just return the pose data back to simulate processing
    return jsonify({"pose_landmarks": pose_data}), 200

@api.route("/process-pose", methods=["POST"])
def process_pose_route():
    # Get the image from the POST request
    image = request.files.get("image")
    
    if not image:
        return jsonify({"error": "No image uploaded"}), 400
    
    # Process the pose in the image using the utility function
    landmarks = process_pose(image)
    
    if landmarks:
        return jsonify({"pose_landmarks": landmarks}), 200
    else:
        return jsonify({"error": "No landmarks detected"}), 404
    
@app.route('/upload-video', methods=['POST'])
def upload_video():
    video = request.files.get("video")
    if not video:
        return jsonify({"error": "No video file provided"}), 400

    filename = video.filename
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    video.save(filepath)

    pose_data = process_pose(filepath)
    
    if pose_data:
        return jsonify({"pose_data_file": pose_data}), 200
    else:
        return jsonify({"error": "Pose processing failed"}), 500

def process_pose(video_path):
    # Open the video file
    cap = cv2.VideoCapture(video_path)
    pose_data = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Convert to RGB before processing with MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb_frame)

        if results.pose_landmarks:
            # Collect pose landmarks
            pose_landmarks = [(landmark.x, landmark.y, landmark.z) for landmark in results.pose_landmarks.landmark]
            pose_data.append(pose_landmarks)

    cap.release()

    if pose_data:
        # Save pose data to a file or return directly
        pose_data_file = "pose_data.json"
        with open(os.path.join(UPLOAD_FOLDER, pose_data_file), 'w') as f:
            json.dump(pose_data, f)
        return pose_data_file

    return None
@api.route("/rig-avatar", methods=["POST"])
def rig_avatar():
    avatar_id = request.json.get("avatar_id")
    user_id = request.json.get("user_id")

    if not avatar_id or not user_id:
        return jsonify({"error": "Missing avatar_id or user_id"}), 400

    # Load user and check existence
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get current usage or create new tracker
    user_usage = UserUsage.query.filter_by(user_id=user_id).first()
    if not user_usage:
        user_usage = UserUsage(user_id=user_id, rigging_sessions=0)

    # Enforce plan limits
    plan = user.subscription_plan  # assume this is a string like 'Basic', 'Pro'
    PLAN_LIMITS = {
        "Basic": 5,
        "Pro": 20,
        "Premium": 50
    }
    limit = PLAN_LIMITS.get(plan, 5)

    if user_usage.rigging_sessions >= limit:
        return jsonify({
            "error": "Rigging limit reached for your plan",
            "plan": plan,
            "limit": limit
        }), 403

    # Load avatar
    avatar = Avatar.query.get(avatar_id)
    if not avatar:
        return jsonify({"error": "Avatar not found"}), 404

    glb_path = os.path.join("static/uploads", avatar.filename)

    # Rig the avatar (returns .glb/.fbx path + bone map)
    rigged_file_path, bone_map = external_rigging_tool(glb_path)
    if not rigged_file_path:
        return jsonify({"error": "Rigging failed"}), 500

    # Save rigged avatar
    rig = RiggedAvatar(
        user_id=user_id,
        avatar_id=avatar_id,
        rig_type="auto",
        rig_file_url=rigged_file_path,
        bone_map_json=bone_map
    )
    db.session.add(rig)
    db.session.flush()

    # Create skeleton hierarchy
    skeleton_id = create_default_skeleton(rig.id)

    # Increment usage
    user_usage.rigging_sessions += 1
    db.session.add(user_usage)

    db.session.commit()

    return jsonify({
        "message": "Avatar rigged successfully",
        "rig_url": rigged_file_path,
        "rigged_avatar_id": rig.id,
        "skeleton_id": skeleton_id,
        "bone_map": bone_map,
        "usage": user_usage.rigging_sessions,
        "limit": limit
    }), 200

@api.route("/admin/user-usage", methods=["GET"])
def get_all_user_usage():
    usage = UserUsage.query.all()
    return jsonify([
        {
            "user_id": u.user_id,
            "rigging_sessions": u.rigging_sessions,
            "storage_used_mb": u.storage_used_mb,
            "videos_rendered": u.videos_rendered
        } for u in usage
    ])


@api.route("/update-plan", methods=["POST"])
def update_plan():
    data = request.json
    user_id = data["user_id"]
    new_plan = data["plan"]
    user = User.query.get(user_id)
    if user:
        user.subscription_plan = new_plan
        db.session.commit()
        return jsonify({"message": "Plan updated"}), 200

# // backend route for Stripe (Flask)

@api.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    data = request.get_json()
    plan = data.get("plan")
    user_id = data.get("user_id")

    if not plan or plan not in STRIPE_PRICE_IDS:
        return jsonify({"error": "Invalid or missing plan"}), 400

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": STRIPE_PRICE_IDS[plan],
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=f"{os.getenv('FRONTEND_URL')}/subscription-success?user_id={user_id}&plan={plan}",
            cancel_url=f"{os.getenv('FRONTEND_URL')}/pricing",
            metadata={"user_id": user_id, "selected_plan": plan}
        )
        return jsonify({"url": checkout_session.url}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# backend route to get usage info
@api.route("/api/usage/<int:user_id>", methods=["GET"])
def get_usage(user_id):
    user = User.query.get(user_id)
    usage = UserUsage.query.filter_by(user_id=user_id).first()
    PLAN_LIMITS = {"Basic": 5, "Pro": 20, "Premium": float("inf")}
    limit = PLAN_LIMITS.get(user.subscription_plan, 5)
    return jsonify({
        "usage": usage.rigging_sessions,
        "limit": limit,
        "plan": user.subscription_plan
    })

@api.route("/update-session-links", methods=["POST"])
def update_session_links():
    data = request.json
    session_id = data.get("session_id")
    rigged_avatar_id = data.get("rigged_avatar_id")
    audio_filename = data.get("audio_filename")
    beat_timestamps = data.get("beat_timestamps")

    session = MotionCaptureSession.query.get(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404

    session.rigged_avatar_id = rigged_avatar_id
    session.audio_filename = audio_filename
    session.beat_timestamps = beat_timestamps

    db.session.commit()
    return jsonify({"message": "Session updated with audio and rig links"}), 200

# api/routes.py

@api.route("/motion-sessions/<int:user_id>", methods=["GET"])
def get_motion_sessions(user_id):
    sessions = MotionCaptureSession.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            "id": s.id,
            "avatar_id": s.avatar_id,
            "pose_data_url": s.pose_data_url,
            "source_type": s.source_type,
            "created_at": s.created_at.isoformat()
        }
        for s in sessions
    ])

@api.route("/save-beat-map", methods=["POST"])
def save_beat_map():
    if request.content_type.startswith("application/json"):
        # Handle JSON payload
        data = request.get_json()
        user_id = data.get("user_id")
        avatar_id = data.get("avatar_id")
        audio_filename = data.get("audio_filename")
        beat_timestamps = data.get("beat_timestamps")

        if not all([user_id, audio_filename, beat_timestamps]):
            return jsonify({"error": "Missing required fields"}), 400

    elif request.content_type.startswith("multipart/form-data"):
        # Handle form-data (file upload)
        audio = request.files.get("audio")
        song_name = request.form.get("song_name")
        beat_timestamps = request.form.get("beat_times", "[]")
        user_id = request.form.get("user_id", None)

        if not audio or not song_name:
            return jsonify({"error": "Missing song name or audio file"}), 400

        filename = secure_filename(audio.filename)
        filepath = os.path.join("static", "uploads", filename)
        audio.save(filepath)

        audio_filename = filename
        avatar_id = None  # Optional
        try:
            beat_timestamps = json.loads(beat_timestamps)
        except Exception:
            return jsonify({"error": "Invalid beat_times format"}), 400

    else:
        return jsonify({"error": "Unsupported Content-Type"}), 415

    # Save to DB
    beat_map = MotionAudioSync(
        user_id=user_id,
        avatar_id=avatar_id,
        audio_filename=audio_filename,
        beat_timestamps=beat_timestamps,
        created_at=datetime.utcnow()
    )
    db.session.add(beat_map)
    db.session.commit()

    return jsonify({"message": "Beat map saved", "id": beat_map.id}), 201

@api.route("/get-beat-map/<int:user_id>", methods=["GET"])
def get_beat_maps(user_id):
    beat_maps = MotionAudioSync.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            "id": b.id,
            "audio_filename": b.audio_filename,
            "avatar_id": b.avatar_id,
            "beat_timestamps": b.beat_timestamps,
            "created_at": b.created_at.isoformat()
        }
        for b in beat_maps
    ]), 200

@api.route("/beat-map/<int:beat_map_id>", methods=["DELETE"])
def delete_beat_map(beat_map_id):
    beat_map = MotionAudioSync.query.get(beat_map_id)
    if not beat_map:
        return jsonify({"error": "Beat map not found"}), 404

    db.session.delete(beat_map)
    db.session.commit()
    return jsonify({"message": "Beat map deleted successfully"}), 200

@api.route("/beat-map/<int:beat_map_id>", methods=["PUT"])
def update_beat_map(beat_map_id):
    beat_map = MotionAudioSync.query.get(beat_map_id)
    if not beat_map:
        return jsonify({"error": "Beat map not found"}), 404

    data = request.json
    beat_timestamps = data.get("beat_timestamps")
    if not beat_timestamps:
        return jsonify({"error": "Missing beat_timestamps"}), 400

    beat_map.beat_timestamps = beat_timestamps
    db.session.commit()

    return jsonify({"message": "Beat map updated"}), 200


@api.route("/audio-sync", methods=["POST"])
def save_audio_sync():
    data = request.json
    user_id = data.get("user_id")
    avatar_id = data.get("avatar_id")
    audio_filename = data.get("audio_filename")
    beat_timestamps = data.get("beat_timestamps")
    custom_notes = data.get("custom_notes")

    if not user_id or not audio_filename or not beat_timestamps:
        return jsonify({"error": "Missing required fields"}), 400

    sync = MotionAudioSync(
        user_id=user_id,
        avatar_id=avatar_id,
        audio_filename=audio_filename,
        beat_timestamps=beat_timestamps,
        custom_notes=custom_notes,
    )
    db.session.add(sync)
    db.session.commit()
    return jsonify({"message": "Audio sync saved", "id": sync.id}), 200


@api.route("/audio-sync/<int:user_id>", methods=["GET"])
def get_audio_syncs(user_id):
    syncs = MotionAudioSync.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            "id": s.id,
            "audio_filename": s.audio_filename,
            "beat_timestamps": s.beat_timestamps,
            "custom_notes": s.custom_notes,
        } for s in syncs
    ])

@api.route("/save-beat-timestamps", methods=["POST"])
def save_beat_timestamps():
    data = request.json
    user_id = data.get("user_id")
    song_name = data.get("song_name")
    beat_times = data.get("beat_times")

    if not user_id or not song_name or not beat_times:
        return jsonify({"error": "Missing fields"}), 400

    beat = MotionAudioSync(
        user_id=user_id,
        song_name=song_name,
        beat_timestamps=beat_times,
        created_at=datetime.utcnow()
    )

    db.session.add(beat)
    db.session.commit()
    return jsonify({"message": "Beat timestamps saved", "id": beat.id})


if __name__ == "__main__":
    app.run(debug=True)