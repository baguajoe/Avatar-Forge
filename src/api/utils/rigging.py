import os
import shutil

def external_rigging_tool(glb_path):
    """
    Dummy rigging tool: Copies .glb and simulates rigging by renaming it.
    Returns path to the 'rigged' avatar and a fake bone map.
    """
    if not glb_path.endswith(".glb"):
        raise ValueError("Only .glb files supported for mock rigging")

    rigged_path = glb_path.replace(".glb", "_rigged.glb")
    shutil.copy(glb_path, rigged_path)

    # Simulate bone map structure
    bone_map = {
        "hips": "Hips",
        "spine": "Spine",
        "chest": "Chest",
        "neck": "Neck",
        "head": "Head",
        "left_arm": "LeftArm",
        "left_forearm": "LeftForeArm",
        "left_hand": "LeftHand",
        "right_arm": "RightArm",
        "right_forearm": "RightForeArm",
        "right_hand": "RightHand",
        "left_leg": "LeftLeg",
        "left_foot": "LeftFoot",
        "right_leg": "RightLeg",
        "right_foot": "RightFoot"
    }

    return rigged_path, bone_map
