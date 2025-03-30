// src/component/MotionCaptureWithRecording.js
import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const MotionCaptureWithRecording = ({ socket, onPoseFrame }) => {
    const videoRef = useRef(null);
    const [recordedLandmarks, setRecordedLandmarks] = useState([]);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        const pose = new Pose({
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
            if (results.poseLandmarks) {
                const timestamp = (Date.now() - startTime) / 1000; // seconds
                const frame = {
                    time: timestamp,
                    landmarks: results.poseLandmarks,
                };

                setRecordedLandmarks((prev) => [...prev, frame]);

                // 🔄 Send frame to backend (optional)
                fetch(`${process.env.REACT_APP_BACKEND_URL}/process-pose`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ pose_data: results.poseLandmarks }),
                });

                // 📡 Stream over WebSocket if available
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: "pose_frame", payload: frame }));
                }

                // 🦴 Pass to parent for live animation
                if (onPoseFrame) {
                    onPoseFrame(frame);
                }
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
        a.download = "pose_landmarks.json";
        a.click();
    };

    return (
        <div>
            <h3>Live Motion Capture with Landmark Recording</h3>
            <video ref={videoRef} autoPlay playsInline muted width="640" height="480" />
            <button onClick={() => {
                const blob = new Blob([JSON.stringify(recordedLandmarks.current)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'pose_data.json';
                a.click();
            }}>Download Pose Data</button>

        </div>
    );
};

export default MotionCaptureWithRecording;
