// src/pages/ReplayMotionSession.js
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
// import { OrbitControls, useGLTF, XR, VRCanvas, Controllers } from '@react-three/drei';
import { OrbitControls } from '@react-three/drei';

import { Line } from 'react-chartjs-2';
import { Chart, TimeScale, LineElement, PointElement, LinearScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(TimeScale, LineElement, PointElement, LinearScale);

const POSE_BONE_MAP = {
  11: 'LeftShoulder', 12: 'RightShoulder', 13: 'LeftUpperArm', 14: 'RightUpperArm',
  15: 'LeftLowerArm', 16: 'RightLowerArm', 23: 'LeftUpperLeg', 24: 'RightUpperLeg',
  25: 'LeftLowerLeg', 26: 'RightLowerLeg', 27: 'LeftFoot', 28: 'RightFoot',
  0: 'Head', 9: 'LeftEye', 10: 'RightEye', 19: 'LeftHand', 20: 'RightHand',
  31: 'LeftFinger', 32: 'RightFinger', 33: 'Mouth', 34: 'Jaw'
};

function Avatar({ frames, currentTime, modelUrl, phoneme }) {
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

    const mouth = scene.getObjectByName('Mouth');
    if (mouth && phoneme) {
      mouth.scale.y = 1 + Math.random() * 0.5;
    }
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
  const [phoneme, setPhoneme] = useState(null);
  const [modelUrl, setModelUrl] = useState('/rigged-avatar.glb');
  const [availableModels] = useState([
    '/rigged-avatar.glb', '/alt-avatar.glb', '/dancer-avatar.glb'
  ]);

  const audioRef = useRef(new Audio());
  const startTimeRef = useRef();
  const requestRef = useRef();
  const mediaRecorderRef = useRef();
  const recordedChunks = useRef([]);

  const animate = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = (timestamp - startTimeRef.current) / 1000;
    setCurrentTime(elapsed);

    const isOnBeat = beatTimes.some((t) => Math.abs(t - elapsed) < 0.05);
    if (isOnBeat) {
      console.log('💥 FX at beat', elapsed);
      // TODO: Trigger FX timeline items here (e.g., particles, lighting)
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  const handlePlay = () => {
    if (!frames.length) return;
    setIsPlaying(true);
    startTimeRef.current = null;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    requestRef.current = requestAnimationFrame(animate);

    const canvasStream = document.querySelector('canvas')?.captureStream();
    if (canvasStream) {
      mediaRecorderRef.current = new MediaRecorder(canvasStream, { mimeType: 'video/webm' });
      mediaRecorderRef.current.ondataavailable = (e) => recordedChunks.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'session-recording.webm';
        a.click();
        recordedChunks.current = [];
      };
      mediaRecorderRef.current.start();
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    audioRef.current.pause();
    cancelAnimationFrame(requestRef.current);
    mediaRecorderRef.current?.stop();
  };

  const handlePoseUpload = (e) => {
    const file = e.target.files[0];
    setPoseFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => setFrames(JSON.parse(evt.target.result));
    reader.readAsText(file);
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    setAudioFile(file);
    const audioURL = URL.createObjectURL(file);
    audioRef.current.src = audioURL;
  };

  const handleExport = async (format) => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/export-${format}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frames })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animation.${format}`;
    a.click();
  };

  const loadBeatMap = async () => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-beat-map/1`);
    const data = await res.json();
    if (data.length > 0) setBeatTimes(data[0].beat_timestamps);
  };

  const saveSessionToProfile = async () => {
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/save-motion-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 1, frames })
    });
    alert('Session saved to profile!');
  };

  useEffect(() => {
    loadBeatMap();

    const recognizer = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      const lastChar = transcript.slice(-1).toLowerCase();
      setPhoneme(lastChar);
    };
    recognizer.start();

    return () => recognizer.stop();
  }, []);

  return (
    <div className="container-fluid">
      <h2 className="text-center">🎥 Replay Motion Session in VR</h2>

      <div className="mb-3 d-flex gap-3">
        <input type="file" accept=".json" onChange={handlePoseUpload} />
        <input type="file" accept="audio/*" onChange={handleAudioUpload} />
        <select onChange={(e) => setModelUrl(e.target.value)} value={modelUrl}>
          {availableModels.map((url) => <option key={url} value={url}>{url}</option>)}
        </select>
        <button className="btn btn-primary" onClick={isPlaying ? handlePause : handlePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button className="btn btn-success" onClick={saveSessionToProfile}>💾 Save to Profile</button>
        <button className="btn btn-secondary" onClick={() => handleExport('fbx')}>Export FBX</button>
        <button className="btn btn-secondary" onClick={() => handleExport('glb')}>Export GLB</button>
        <p className="mt-2">Time: {currentTime.toFixed(2)}s</p>
      </div>

      <VRCanvas camera={{ position: [0, 2, 5] }} style={{ height: '400px' }}>
        <XR>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <OrbitControls />
          <Controllers />
          {frames.length > 0 && <Avatar frames={frames} currentTime={currentTime} modelUrl={modelUrl} phoneme={phoneme} />}
        </XR>
      </VRCanvas>

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