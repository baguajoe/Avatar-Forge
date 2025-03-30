// src/pages/MotionSessionList.js
import React, { useEffect, useState } from "react";

const MotionSessionList = ({ userId }) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/motion-sessions/${userId}`)
      .then((res) => res.json())
      .then(setSessions)
      .catch(console.error);
  }, [userId]);

  return (
    <div>
      <h2>Saved Motion Sessions</h2>
      <ul>
        {sessions.map((s) => (
          <li key={s.id}>
            <p>Type: {s.source_type}</p>
            <p>Avatar: {s.avatar_id}</p>
            <p>Date: {new Date(s.created_at).toLocaleString()}</p>
            <a href={s.pose_data_url} download>Download JSON</a>
            <button onClick={() => console.log("Replay", s.id)}>Replay</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MotionSessionList;
