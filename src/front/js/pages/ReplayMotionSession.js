// src/pages/ReplayMotionSession.js
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Line } from 'react-chartjs-2';
import { Chart, TimeScale, LineElement, PointElement, LinearScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(TimeScale, LineElement, PointElement, LinearScale);

const POSE_BONE_MAP = {
  11: 'LeftShoulder',
  12: 'RightShoulder',
  13: 'LeftUpperArm',
  14: 'RightUpperArm',
  15: 'LeftLowerArm',
  16: 'RightLowerArm',
  23: 'LeftUpperLeg',
  24: 'RightUpperLeg',
  25: 'LeftLowerLeg',
  26: 'RightLowerLeg',
  27: 'LeftFoot',
  28: 'RightFoot',
  0: 'Head',
  9: 'LeftEye',
  10: 'RightEye',
  19: 'LeftHand',
  20: 'RightHand',
  31: 'LeftFinger',
  32: 'RightFinger',
  33: 'Mouth',
  34: 'Jaw'
};

function Avatar({ frames, currentTime, modelUrl }) {
  const { scene } = useGLTF(modelUrl);

  useFrame(() => {
    if (!frames || frames.length === 0) return;

    const currentFrame = frames.find((f) => Math.abs(f.time - currentTime) < 0.03);
    if (!currentFrame) return;

    Object.entries(POSE_BONE_MAP).forEach(([index, boneName]) => {
      const bone = scene.getObjectByName(boneName);
      const lm = currentFrame.landmarks[index];
      if (bone && lm) {
        bone.position.set(lm.x, lm.y, lm.z);
      }
    });
  });

  return <primitive object={scene} scale={1.2} />;
}

const ReplayMotionSession = () => {
  const [frames, setFrames] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [poseFile, setPoseFile] = useState(null);
  const [beatTimes, setBeatTimes] = useState([]);
  const [modelUrl, setModelUrl] = useState('/rigged-avatar.glb');
  const [availableModels] = useState([
    '/rigged-avatar.glb',
    '/alt-avatar.glb',
    '/dancer-avatar.glb'
  ]);

  const audioRef = useRef(new Audio());
  const startTimeRef = useRef();
  const requestRef = useRef();

  const animate = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = (timestamp - startTimeRef.current) / 1000;
    setCurrentTime(elapsed);

    if (elapsed < frames[frames.length - 1]?.time) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
      audioRef.current.pause();
    }
  };

  const handlePlay = () => {
    if (!frames.length) return;
    setIsPlaying(true);
    startTimeRef.current = null;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    requestRef.current = requestAnimationFrame(animate);
  };

  const handlePause = () => {
    setIsPlaying(false);
    audioRef.current.pause();
    cancelAnimationFrame(requestRef.current);
  };

  const handlePoseUpload = (e) => {
    const file = e.target.files[0];
    setPoseFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const json = JSON.parse(evt.target.result);
      setFrames(json);
    };
    reader.readAsText(file);
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    setAudioFile(file);
    const audioURL = URL.createObjectURL(file);
    audioRef.current.src = audioURL;
  };

  const handleExportFBX = async () => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/export-fbx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frames })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animation.fbx';
    a.click();
  };

  const handleExportGLB = async () => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/export-glb`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frames })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animation.glb';
    a.click();
  };

  const loadBeatMap = async () => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-beat-map/1`);
    const data = await res.json();
    if (data.length > 0) setBeatTimes(data[0].beat_timestamps);
  };

  useEffect(() => {
    loadBeatMap();
  }, []);

  return (
    <div className="container-fluid">
      <h2 className="text-center">🎥 Replay Motion Session</h2>

      <div className="mb-3 d-flex gap-3">
        <input type="file" accept=".json" onChange={handlePoseUpload} />
        <input type="file" accept="audio/*" onChange={handleAudioUpload} />

        <select onChange={(e) => setModelUrl(e.target.value)} value={modelUrl}>
          {availableModels.map((url) => (
            <option key={url} value={url}>{url}</option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={isPlaying ? handlePause : handlePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button className="btn btn-secondary" onClick={handleExportFBX}>Export FBX</button>
        <button className="btn btn-secondary" onClick={handleExportGLB}>Export GLB</button>
        <p className="mt-2">Time: {currentTime.toFixed(2)}s</p>
      </div>

      <Canvas camera={{ position: [0, 2, 5] }} style={{ height: '400px' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <OrbitControls />
        {frames.length > 0 && <Avatar frames={frames} currentTime={currentTime} modelUrl={modelUrl} />}
      </Canvas>

      <Line
        data={{
          labels: frames.map((f) => new Date(f.time * 1000)),
          datasets: [
            {
              label: 'Pose Frames',
              data: frames.map((f) => ({ x: f.time * 1000, y: 0 })),
              borderColor: '#888',
              pointRadius: 3,
            },
            {
              label: 'Beats',
              data: beatTimes.map((t) => ({ x: t * 1000, y: 0 })),
              backgroundColor: 'red',
              pointRadius: 5,
              showLine: false,
            },
          ],
        }}
        options={{
          scales: {
            x: {
              type: 'time',
              time: { unit: 'second' },
              title: { display: true, text: 'Time' },
            },
            y: { display: false },
          },
        }}
      />
    </div>
  );
};

export default ReplayMotionSession;