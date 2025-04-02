// src/pages/ProfileSessionGallery.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileSessionGallery = ({ userId = 1 }) => {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-saved-sessions/${userId}`);
      const data = await res.json();
      setSessions(data);
    };
    fetchSessions();
  }, [userId]);

  const handleReplay = (session) => {
    const blob = new Blob([JSON.stringify(session.frames)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    navigate('/replay', { state: { jsonUrl: url, audioUrl: session.audio_url || null } });
  };

  return (
    <div className="container">
      <h2>📂 Your Saved Sessions</h2>
      <div className="row">
        {sessions.map((s) => (
          <div key={s.id} className="col-md-4 mb-4">
            <div className="card shadow">
              <div className="card-body">
                <h5 className="card-title">Session #{s.id}</h5>
                <p className="card-text">🕒 {new Date(s.created_at).toLocaleString()}</p>
                <button className="btn btn-sm btn-outline-primary" onClick={() => handleReplay(s)}>
                  ▶️ Replay
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSessionGallery;
