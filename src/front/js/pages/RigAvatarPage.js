// RigAvatarPage.js
import React, { useState } from 'react';

const RigAvatarPage = () => {
  const [riggedUrl, setRiggedUrl] = useState(null);
  const [usageInfo, setUsageInfo] = useState(null);
  const [message, setMessage] = useState("");

  const avatar_id = localStorage.getItem("avatar_id");
  const user_id = localStorage.getItem("user_id");

  const handleRigging = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/rig-avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_id, user_id })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.error === "Rigging limit reached for your plan") {
          alert(`🚫 Limit reached! Your ${data.plan} plan allows ${data.limit} riggings/month.`);
        } else {
          alert(data.error || "Rigging failed.");
        }
        return;
      }

      // Success
      setRiggedUrl(data.rig_url);
      setUsageInfo({ used: data.usage, limit: data.limit });

      // Optional: Alert if user just hit the limit
      if (data.usage >= data.limit) {
        alert("You've hit your monthly rigging limit. Upgrade your plan to continue.");
      }

    } catch (err) {
      console.error(err);
      setMessage("An error occurred during rigging.");
    }
  };

  return (
    <div>
      <h2>Rig Avatar</h2>
      <button onClick={handleRigging}>Apply Rig</button>

      {riggedUrl && (
        <div>
          <p>✅ Rigged Avatar URL:</p>
          <a href={riggedUrl} target="_blank" rel="noopener noreferrer">{riggedUrl}</a>
        </div>
      )}

      {usageInfo && (
        <p>{usageInfo.used} of {usageInfo.limit} rigging sessions used</p>
      )}

      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
};

export default RigAvatarPage;
