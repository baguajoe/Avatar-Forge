import cv2
import mediapipe as mp
import numpy as np

# Initialize MediaPipe Pose module
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

def process_pose(image):
    """
    Processes the image for pose detection using MediaPipe Pose.
    This function receives an image, processes it to detect pose landmarks,
    and returns the detected landmarks.

    Args:
    image (werkzeug.datastructures.FileStorage): Image file from request

    Returns:
    landmarks_data (list): A list of dictionaries containing x, y, and z coordinates of detected landmarks
    """
    # Convert the byte data into a format OpenCV can process
    frame = cv2.imdecode(np.frombuffer(image.read(), np.uint8), cv2.IMREAD_COLOR)

    # Convert the image to RGB (MediaPipe requires RGB images)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Process the image to detect pose landmarks
    results = pose.process(rgb_frame)

    if results.pose_landmarks:
        # Extract and store the pose landmarks data
        landmarks = results.pose_landmarks.landmark
        landmarks_data = [{"x": landmark.x, "y": landmark.y, "z": landmark.z} for landmark in landmarks]
        return landmarks_data  # Return a list of landmark positions
    else:
        return None  # Return None if no landmarks are detected

def draw_landmarks(frame, landmarks):
    """
    Draws landmarks on the frame using MediaPipe's drawing utils.

    Args:
    frame (ndarray): The frame (image) where landmarks will be drawn
    landmarks (landmarks): Pose landmarks from MediaPipe

    Returns:
    frame (ndarray): The frame with drawn landmarks
    """
    mp.solutions.drawing_utils.draw_landmarks(frame, landmarks, mp_pose.POSE_CONNECTIONS)
    return frame
