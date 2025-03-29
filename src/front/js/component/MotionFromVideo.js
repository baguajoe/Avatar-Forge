import React, { useRef, useEffect } from 'react';
import * as mpPose from '@mediapipe/pose';

const MotionFromVideo = ({ videoUrl }) => {
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
      console.log('Pose landmarks:', results.poseLandmarks);
    });

    const video = videoRef.current;

    video.onloadeddata = () => {
      const interval = setInterval(() => {
        pose.send({ image: video });
      }, 33); // ~30 FPS
      return () => clearInterval(interval);
    };
  }, []);

  return <video ref={videoRef} src={videoUrl} controls width="640" />;
};

export default MotionFromVideo;
