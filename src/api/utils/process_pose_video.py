import cv2
import mediapipe as mp
import json
import os

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

def process_video_for_pose(video_path):
    cap = cv2.VideoCapture(video_path)  # Open the video file
    pose_data = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Convert the frame to RGB for MediaPipe processing
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb_frame)

        if results.pose_landmarks:
            # Convert landmarks to dictionary format
            landmarks = [{'x': landmark.x, 'y': landmark.y, 'z': landmark.z} for landmark in results.pose_landmarks.landmark]
            pose_data.append(landmarks)

    cap.release()

    return pose_data

def save_pose_data(pose_data, output_file):
    with open(output_file, 'w') as f:
        json.dump(pose_data, f)

def process_and_save_pose(video_file):
    pose_data = process_video_for_pose(video_file)
    output_file = os.path.splitext(video_file)[0] + '_pose_data.json'
    save_pose_data(pose_data, output_file)
    return output_file
