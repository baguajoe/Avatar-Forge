// src/component/MotionCaptureWithRecording.js
import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const MotionCaptureWithRecording = ({ socket, onPoseFrame, userId }) => {
  const videoRef = useRef(null);
  const [recordedLandmarks, setRecordedLandmarks] = useState([]);
  const [startTime] = useState(Date.now());
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
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

    pose.onResults((results) => {
      if (results.poseLandmarks) {
        const timestamp = (Date.now() - startTime) / 1000;
        const frame = {
          time: timestamp,
          landmarks: results.poseLandmarks,
        };

        setRecordedLandmarks((prev) => [...prev, frame]);

        // Optional backend sync
        fetch(`${process.env.REACT_APP_BACKEND_URL}/process-pose`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pose_data: results.poseLandmarks }),
        });

        // WebSocket stream
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "pose_frame", payload: frame }));
        }

        if (onPoseFrame) onPoseFrame(frame);
      }
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, [socket, onPoseFrame, startTime]);

  const handleExport = () => {
    const json = JSON.stringify(recordedLandmarks);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "pose_data.json";
    a.click();
  };

  const handleUpload = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/save-mocap-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          landmarks: recordedLandmarks,
        }),
      });
      const data = await res.json();
      setSaveStatus(data.message || "Upload complete!");
    } catch (err) {
      console.error("Upload failed:", err);
      setSaveStatus("Upload failed.");
    }
  };

  return (
    <div>
      <h3>Live Motion Capture with Landmark Recording</h3>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="640"
        height="480"
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleExport}>📥 Download Pose Data</button>
        <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
          ⬆️ Upload to Backend
        </button>
        {saveStatus && <p>{saveStatus}</p>}
      </div>
    </div>
  );
};

export default MotionCaptureWithRecording;
