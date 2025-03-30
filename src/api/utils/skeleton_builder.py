from flask import current_app
from api.models import db, Skeleton, Bone

def create_default_skeleton(rigged_avatar_id):
    """
    Creates a default T-pose skeleton hierarchy and links it to a RiggedAvatar.
    """
    # Safety check: ensure we're inside a Flask app context
    if not current_app:
        raise RuntimeError("create_default_skeleton() must be called within an app context.")

    skeleton = Skeleton(rigged_avatar_id=rigged_avatar_id)
    db.session.add(skeleton)
    db.session.flush()  # Get skeleton.id for child bones

    bone_structure = [
        {"name": "Hips", "parent": None},
        {"name": "Spine", "parent": "Hips"},
        {"name": "Chest", "parent": "Spine"},
        {"name": "Neck", "parent": "Chest"},
        {"name": "Head", "parent": "Neck"},
        {"name": "LeftShoulder", "parent": "Chest"},
        {"name": "LeftArm", "parent": "LeftShoulder"},
        {"name": "LeftForeArm", "parent": "LeftArm"},
        {"name": "LeftHand", "parent": "LeftForeArm"},
        {"name": "RightShoulder", "parent": "Chest"},
        {"name": "RightArm", "parent": "RightShoulder"},
        {"name": "RightForeArm", "parent": "RightArm"},
        {"name": "RightHand", "parent": "RightForeArm"},
        {"name": "LeftUpLeg", "parent": "Hips"},
        {"name": "LeftLeg", "parent": "LeftUpLeg"},
        {"name": "LeftFoot", "parent": "LeftLeg"},
        {"name": "RightUpLeg", "parent": "Hips"},
        {"name": "RightLeg", "parent": "RightUpLeg"},
        {"name": "RightFoot", "parent": "RightLeg"},
    ]

    bone_objs = {}
    for b in bone_structure:
        parent_bone = bone_objs.get(b["parent"])
        new_bone = Bone(
            name=b["name"],
            parent=parent_bone,
            skeleton_id=skeleton.id,
            offset_x=0.0,  # You can replace with real landmark offsets later
            offset_y=0.0,
            offset_z=0.0
        )
        db.session.add(new_bone)
        db.session.flush()
        bone_objs[b["name"]] = new_bone

    db.session.commit()
    return skeleton.id
