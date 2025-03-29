import React, { useEffect, useRef } from 'react';
import * as mpPose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

const MotionCapture = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const pose = new mpPose.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      console.log('Pose Results:', results);
    });

    if (typeof videoRef.current !== 'undefined' && videoRef.current !== null) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  return <video ref={videoRef} autoPlay playsInline width="640" height="480" />;
};

export default MotionCapture;
