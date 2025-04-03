import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const MotionCaptureWithRecording = ({ userId, socket, onPoseFrame }) => {
  const videoRef = useRef(null);
  const avatarRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const [recordingVideo, setRecordingVideo] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const [recordedLandmarks, setRecordedLandmarks] = useState([]);
  const [startTime] = useState(Date.now());
  const [saveStatus, setSaveStatus] = useState("");
  const [convertedUrl, setConvertedUrl] = useState(null);

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
        const frame = { time: timestamp, landmarks: results.poseLandmarks };
        setRecordedLandmarks((prev) => [...prev, frame]);

        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "pose_frame", payload: frame }));
        }

        fetch(`${process.env.REACT_APP_BACKEND_URL}/process-pose`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pose_data: results.poseLandmarks }),
        });

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

  const startVideoRecording = () => {
    const stream = videoRef.current.captureStream();
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    setRecordedChunks([]); // reset before each recording

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setRecordedChunks((prev) => [...prev, e.data]);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const filename = `recorded_motion_${Date.now()}.webm`;

      // Save .webm locally
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();

      // Auto upload .webm to server
      const formData = new FormData();
      formData.append("video", blob, filename);

      try {
        const uploadRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/upload-video`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.error) {
          console.error("Upload error:", uploadData.error);
          setSaveStatus("Upload failed.");
          return;
        }

        // Now convert to MP4
        const convertRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/convert-to-mp4`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        });

        const convertData = await convertRes.json();

        if (convertData.mp4_url) {
          setConvertedUrl(`${process.env.REACT_APP_BACKEND_URL}${convertData.mp4_url}`);
          setSaveStatus("🎉 MP4 conversion complete!");
        } else {
          console.error("Conversion error:", convertData.error);
          setSaveStatus("MP4 conversion failed.");
        }
      } catch (err) {
        console.error("Upload or conversion failed:", err);
        setSaveStatus("An error occurred.");
      }
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecordingVideo(true);
  };

  const stopVideoRecording = () => {
    mediaRecorderRef.current.stop();
    setRecordingVideo(false);
  };

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
      <h3>Live Motion Capture with Recording</h3>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="640"
        height="480"
        id="avatar-video"
      />

      <div ref={avatarRef} style={{ display: "none" }} />

      <div className="mt-3 d-flex gap-2 flex-wrap">
        <button
          className="btn btn-primary"
          onClick={recordingVideo ? stopVideoRecording : startVideoRecording}
        >
          {recordingVideo ? "⏹ Stop Recording" : "⏺ Start Video Recording"}
        </button>

        <button className="btn btn-success" onClick={handleExport}>
          📥 Download Pose Data
        </button>

        <button className="btn btn-warning" onClick={handleUpload}>
          ⬆️ Upload to Backend
        </button>

        {convertedUrl && (
          <a className="btn btn-outline-success" href={convertedUrl} target="_blank" rel="noreferrer">
            🎬 View MP4
          </a>
        )}
      </div>

      {saveStatus && <p className="mt-2">{saveStatus}</p>}
    </div>
  );
};

export default MotionCaptureWithRecording;
