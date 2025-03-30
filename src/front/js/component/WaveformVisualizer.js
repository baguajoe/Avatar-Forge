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
  const avatarRef = useRef();
  const audioRef = useRef();

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

  return (
    <div className="container mt-4">
      <h2>🎵 Dance Sync</h2>

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
