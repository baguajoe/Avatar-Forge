# api/routes.py

from flask import request, jsonify, Blueprint
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os

# from api import api
from api.models import db, Avatar, Customization
from .utils.deep3d_api import send_to_deep3d  # Ensure this exists and returns a valid URL

api = Blueprint('api', __name__)



# Enable CORS
CORS(api)

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

