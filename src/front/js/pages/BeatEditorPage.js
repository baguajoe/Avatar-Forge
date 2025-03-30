// src/pages/BeatEditorPage.js
import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';

const BeatEditorPage = () => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [audioFile, setAudioFile] = useState(null);
  const [beatMarkers, setBeatMarkers] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (waveformRef.current && !wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#ccc',
        progressColor: '#4CAF50',
        height: 100,
      });

      wavesurfer.current.on('ready', () => {
        console.log('Waveform ready');
      });

      wavesurfer.current.on('seek', () => {
        setCurrentTime(wavesurfer.current.getCurrentTime());
      });
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, []);

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    setAudioFile(file);
    if (wavesurfer.current) {
      wavesurfer.current.loadBlob(file);
    }
  };

  const handleAddBeat = () => {
    const time = wavesurfer.current.getCurrentTime();
    const newMarker = { time };
    setBeatMarkers([...beatMarkers, newMarker]);
  };

  const handleExportBeats = () => {
    const blob = new Blob([JSON.stringify(beatMarkers)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beat_timestamps.json';
    a.click();
  };

  return (
    <div>
      <h2>Beat Editor Timeline</h2>
      <input type="file" accept="audio/*" onChange={handleAudioUpload} />

      <div ref={waveformRef} style={{ width: '100%', marginTop: 20 }} />

      <button onClick={handleAddBeat}>➕ Mark Beat at {currentTime.toFixed(2)}s</button>
      <button onClick={handleExportBeats} style={{ marginLeft: '10px' }}>⬇️ Export Beat Data</button>

      <ul>
        {beatMarkers.map((beat, i) => (
          <li key={i}>🟡 Beat at {beat.time.toFixed(2)}s</li>
        ))}
      </ul>
    </div>
  );
};

export default BeatEditorPage;