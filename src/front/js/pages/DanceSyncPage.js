import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import AnimatedAvatar from "../components/AnimatedAvatar";
import WaveformVisualizer from "../components/WaveformVisualizer";

const DanceSyncPage = () => {
  const [beatTimes, setBeatTimes] = useState([]);
  const [tempo, setTempo] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [danceStyle, setDanceStyle] = useState("bounce");
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [progress, setProgress] = useState(0); // Progress state for video conversion
  const avatarRef = useRef();
  const audioRef = useRef();
  const recorderRef = useRef(null);
  const [visemes, setVisemes] = useState([]);
  const voiceRef = useRef(null);

  // Handle audio upload and beat detection
  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setAudioUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("audio", file);

    const res = await fetch("/api/analyze-beats", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setBeatTimes(data.beat_times);
    setTempo(data.tempo);
  };

  // Handle voice upload for lip-sync
  const handleVoiceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("audio", file);

    const res = await fetch("/api/analyze-voice", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setVisemes(data.visemes);

    // Optional: play voice
    voiceRef.current.src = URL.createObjectURL(file);
  };

  // Handle playback and avatar animation
  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio || !beatTimes.length) return;

    audio.currentTime = 0;
    audio.play();

    beatTimes.forEach((time) => {
      setTimeout(() => {
        if (avatarRef.current) {
          avatarRef.current.animate();
        }
      }, time * 1000);
    });
  };

  // Start recording video and audio
  const startRecording = () => {
    const canvas = document.querySelector("canvas");
    const canvasStream = canvas.captureStream(30);
    const audioStream = audioRef.current.captureStream();

    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ]);

    const recorder = new MediaRecorder(combinedStream, { mimeType: "video/webm" });
    recorderRef.current = recorder;

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const localUrl = URL.createObjectURL(blob);
      setDownloadUrl(localUrl);
      setRecordedChunks(chunks);

      // Upload to Flask
      const formData = new FormData();
      formData.append("video", blob, "recording.webm");

      const uploadRes = await fetch("/api/upload-video", {
        method: "POST",
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (uploadData.video_url) {
        console.log("✅ Uploaded video:", uploadData.video_url);
        setDownloadUrl(uploadData.video_url); // use server-side URL instead of local blob
      }
    };

    recorder.start();
    setRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setRecording(false);
    }
  };

  // Save session to database
  const saveSessionToDB = async () => {
    const sessionData = {
      user_id: 1,
      song_name: fileName,
      tempo,
      beat_times: beatTimes,
      style: danceStyle,
      video_url: downloadUrl,
    };

    await fetch("/api/save-dance-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionData),
    });

    alert("🎉 Dance session saved to database!");
  };

  // Convert to MP4
  const convertToMp4 = async () => {
    const filename = downloadUrl.split("/").pop(); // get `recording.webm`
    const res = await fetch("/api/convert-to-mp4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename })
    });
  
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let progressData = "";
    
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      progressData += decoder.decode(value, { stream: true });
      done = readerDone;
      
      // Parse progress data and update the progress bar
      const match = progressData.match(/out_time=(\d+.\d+)/);
      if (match) {
        const percentage = (parseFloat(match[1]) / totalDuration) * 100;
        setProgress(Math.round(percentage));
      }
    }
  
    const data = await res.json();
    if (data.mp4_url) {
      window.open(data.mp4_url, "_blank");
    }
  };

  // Convert to AVI
  const convertToAvi = async () => {
    const filename = downloadUrl.split("/").pop(); // get `recording.webm`
    const res = await fetch("/api/convert-to-avi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename })
    });
    const data = await res.json();
    if (data.avi_url) {
      window.open(data.avi_url, "_blank");
    }
  };

  // Convert to MOV
  const convertToMov = async () => {
    const filename = downloadUrl.split("/").pop(); // get `recording.webm`
    const res = await fetch("/api/convert-to-mov", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename })
    });
    const data = await res.json();
    if (data.mov_url) {
      window.open(data.mov_url, "_blank");
    }
  };

  return (
    <div className="container mt-4">
      <h2>🎵 Dance Sync Studio</h2>

      <input
        type="file"
        accept="audio/*"
        onChange={handleAudioUpload}
        className="form-control my-3"
      />

      {tempo && (
        <div className="mb-3">
          <strong>File:</strong> {fileName} <br />
          <strong>Tempo:</strong> {Math.round(tempo)} BPM <br />
          <strong>Beats:</strong> {beatTimes.length}
        </div>
      )}

      {audioUrl && (
        <>
          <button className="btn btn-primary me-2" onClick={handlePlay}>
            ▶️ Play with Avatar
          </button>
          <audio ref={audioRef} src={audioUrl} controls className="mt-2 mb-3" />
        </>
      )}

      <div className="mb-3">
        <label className="form-label"><strong>Select Dance Style:</strong></label>
        <select
          className="form-select w-auto"
          value={danceStyle}
          onChange={(e) => setDanceStyle(e.target.value)}
        >
          <option value="bounce">Bounce</option>
          <option value="shuffle">Shuffle</option>
          <option value="arms">Arms</option>
          <option value="freestyle">Freestyle</option>
        </select>
      </div>

      {audioUrl && beatTimes.length > 0 && (
        <WaveformVisualizer
          audioUrl={audioUrl}
          beatTimes={beatTimes}
          onManualTrigger={() => {
            if (avatarRef.current) {
              avatarRef.current.animate();
            }
          }}
        />
      )}

      <div className="mb-4">
        {!recording ? (
          <button className="btn btn-outline-danger me-2" onClick={startRecording} disabled={!audioUrl}>
            🎥 Start Recording
          </button>
        ) : (
          <button className="btn btn-outline-dark me-2" onClick={stopRecording}>
            ⏹ Stop Recording
          </button>
        )}

        {downloadUrl && (
          <>
            <a href={downloadUrl} download="avatar_dance.webm" className="btn btn-success me-2">
              💾 Download Video
            </a>
            <button className="btn btn-outline-success" onClick={saveSessionToDB}>
              📥 Save Session to DB
            </button>
            {/* Conversion buttons */}
            {downloadUrl?.endsWith(".webm") && (
              <>
                <button className="btn btn-warning mt-2" onClick={convertToMp4}>
                  🎞 Convert to MP4
                </button>
                <button className="btn btn-warning mt-2 ms-2" onClick={convertToAvi}>
                  🎞 Convert to AVI
                </button>
                <button className="btn btn-warning mt-2 ms-2" onClick={convertToMov}>
                  🎞 Convert to MOV
                </button>
              </>
            )}
          </>
        )}
      </div>

      <Canvas style={{ height: "500px" }}>
        <ambientLight />
        <Stage environment="city" intensity={0.8}>
          <AnimatedAvatar ref={avatarRef} style={danceStyle} />
        </Stage>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default DanceSyncPage;
