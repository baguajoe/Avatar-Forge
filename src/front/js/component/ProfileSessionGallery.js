import React, { useEffect, useState } from 'react';

const ProfileSessionGallery = ({ userId }) => {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('');
  const [showWaveform, setShowWaveform] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/get-saved-sessions/${userId}`)
      .then(res => res.json())
      .then(data => setSessions(data));
  }, [userId]);

  const handleDelete = async (id) => {
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/delete-session/${id}`, { method: 'DELETE' });
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const filtered = sessions.filter(session =>
    session.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-3">
      <h3>🎞 Your Saved Sessions</h3>
      <input
        className="form-control mb-2"
        placeholder="Filter by name/date"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <label>
        <input type="checkbox" checked={showWaveform} onChange={() => setShowWaveform(!showWaveform)} />
        Show waveform preview
      </label>

      {filtered.map((sesh) => (
        <div key={sesh.id} className="card my-3 p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{sesh.name || 'Untitled Session'}</strong>
              <p className="text-muted">{new Date(sesh.created_at).toLocaleString()}</p>
              {sesh.thumbnail_url && <img src={sesh.thumbnail_url} alt="thumb" style={{ width: 100 }} />}
            </div>
            <div className="d-flex gap-2">
              <a href={`/replay/${sesh.id}`} className="btn btn-primary">▶ Replay</a>
              <button onClick={() => handleDelete(sesh.id)} className="btn btn-danger">🗑</button>
            </div>
          </div>
          {showWaveform && sesh.audio_url && (
            <audio src={sesh.audio_url} controls className="mt-2" />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProfileSessionGallery;
