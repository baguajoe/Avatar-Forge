# face_mesh_detection.py
import cv2
import mediapipe as mp
import os

mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Initialize Face Mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5)

def detect_face_mesh(image_path):
    """
    Detect face mesh landmarks and save the output image with drawn mesh.

    Args:
    image_path (str): Path to the image file.

    Returns:
    str: Path to the processed image with face mesh, or None if no face is detected.
    """
    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    results = face_mesh.process(image_rgb)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            mp_drawing.draw_landmarks(
                image=image,
                landmark_list=face_landmarks,
                connections=mp_face_mesh.FACEMESH_TESSELATION,
                landmark_drawing_spec=None,
                connection_drawing_spec=mp_drawing_styles
                .get_default_face_mesh_tesselation_style())

        processed_filepath = image_path.replace(".jpg", "_mesh.jpg")
        cv2.imwrite(processed_filepath, image)

        return processed_filepath
    else:
        return None
