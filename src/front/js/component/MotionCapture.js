import React, { useEffect, useRef } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

const MotionCapture = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(async (results) => {
      if (results.poseLandmarks) {
        console.log('Sending landmarks to backend...', results.poseLandmarks);

        try {
          await fetch(`${process.env.REACT_APP_BACKEND_URL}/process-pose`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pose_data: results.poseLandmarks }),
          });
        } catch (err) {
          console.error('Error sending pose data:', err);
        }
      }
    });

    const camera = new Camera(video, {
      onFrame: async () => {
        await pose.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }, []);

  return (
    <div>
      <h3>Live Motion Capture</h3>
      <video ref={videoRef} id="input_video" autoPlay muted playsInline width="640" height="480" />
    </div>
  );
};

export default MotionCapture;
