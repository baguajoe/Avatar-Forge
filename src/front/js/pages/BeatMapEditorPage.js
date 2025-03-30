// src/pages/BeatmapEditorPage.js
import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';


const BeatmapEditorPage = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [beatMarkers, setBeatMarkers] = useState([]);
  const [songName, setSongName] = useState('');
  const [userId, setUserId] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0);

  const waveformRef = useRef(null);
  const timelineRef = useRef(null);
  const wavesurferRef = useRef(null);

  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#ddd',
        progressColor: '#3b82f6',
        height: 100,
        cursorColor: '#000',
        plugins: [
          TimelinePlugin({ container: timelineRef.current })
        ]
      });

      wavesurferRef.current.on('ready', () => {
        wavesurferRef.current.drawer.wrapper.addEventListener('click', (e) => {
          const rect = wavesurferRef.current.drawer.wrapper.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const width = rect.width;
          const duration = wavesurferRef.current.getDuration();
          const time = (clickX / width) * duration;
          setBeatMarkers((prev) => [...prev, time]);
        });
      });
    }
  }, []);

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAudioFile(file);
    if (wavesurferRef.current) {
      wavesurferRef.current.empty();
      wavesurferRef.current.loadBlob(file);
      setBeatMarkers([]);
    }
  };

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handleZoom = (e) => {
    const value = Number(e.target.value);
    setZoomLevel(value);
    if (wavesurferRef.current) {
      wavesurferRef.current.zoom(value);
    }
  };

  const handleRemoveLast = () => {
    setBeatMarkers((prev) => prev.slice(0, -1));
  };

  const handleSaveBeats = async () => {
    if (!audioFile || !songName) {
      alert("Please upload audio and enter song name.");
      return;
    }

    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('song_name', songName);
    formData.append('user_id', userId || '');
    formData.append('beat_times', JSON.stringify(beatMarkers));

    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/save-beat-map`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    alert(data.message || "Saved");
  };

  return (
    <div className="container">
      <h2>🎵 Beatmap Editor</h2>

      <div className="mb-2">
        <input type="file" accept="audio/*" onChange={handleAudioUpload} />
      </div>

      <div className="mb-2">
        <input
          className="form-control"
          placeholder="Song Name"
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <input
          className="form-control"
          placeholder="User ID (optional)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>

      <div id="waveform" ref={waveformRef} className="my-3" />
      <div id="timeline" ref={timelineRef} className="mb-3" />

      <div className="mb-3 d-flex gap-2 align-items-center">
        <button className="btn btn-primary" onClick={handlePlayPause}>
          {isPlaying ? "⏸ Pause" : "▶️ Play"}
        </button>
        <button className="btn btn-warning" onClick={handleRemoveLast}>
          ❌ Remove Last Beat
        </button>
        <label className="ms-3">Zoom:</label>
        <input type="range" min="0" max="200" value={zoomLevel} onChange={handleZoom} />
      </div>

      <p>Click waveform to add beats ⏱️</p>
      <ul>
        {beatMarkers.map((t, i) => (
          <li key={i}>🟡 {t.toFixed(2)} sec</li>
        ))}
      </ul>

      <button className="btn btn-success" onClick={handleSaveBeats}>
        💾 Save Beatmap
      </button>
    </div>
  );
};

export default BeatmapEditorPage;
