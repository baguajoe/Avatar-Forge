import cv2
import mediapipe as mp
import numpy as np
import trimesh
import os
from mediapipe.python.solutions.face_mesh_connections import FACEMESH_TESSELATION

# Initialize MediaPipe FaceMesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True)

def generate_3d_mesh(image_path, output_path="face_mesh.glb"):
    image = cv2.imread(image_path)
    h, w, _ = image.shape
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    results = face_mesh.process(image_rgb)

    if not results.multi_face_landmarks:
        print("No face detected.")
        return None

    # Get 468 landmarks
    landmarks = results.multi_face_landmarks[0]
    vertices = []
    for lm in landmarks.landmark:
        x = lm.x * w
        y = lm.y * h
        z = lm.z * 100  # Depth scaling
        vertices.append([x, y, z])

    # Convert to numpy array
    vertices = np.array(vertices)

    # Use MediaPipe's FACEMESH_TESSELATION for connectivity
    faces = []
    for connection in FACEMESH_TESSELATION:
        i, j = connection
        k = (i + j) // 2  # crude 3rd point (for triangle fan shape)
        if k < len(vertices):
            faces.append([i, j, k])

    mesh = trimesh.Trimesh(vertices=vertices, faces=faces)

    # Export to .glb or .obj
    mesh.export(output_path)
    print(f"Exported 3D mesh to {output_path}")
    return output_path

# Example usage
if __name__ == "__main__":
    input_image = "selfie.jpg"  # Change this to your image path
    output_model = "face_mesh.glb"  # Can also use "face_mesh.obj"
    generate_3d_mesh(input_image, output_model)
