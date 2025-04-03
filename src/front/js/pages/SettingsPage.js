// src/front/js/pages/SettingsPage.js
import React, { useState } from "react";

const SettingsPage = () => {
  const [theme, setTheme] = useState("light");
  const [layout, setLayout] = useState("standard");
  const [notifications, setNotifications] = useState(true);
  const [message, setMessage] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    // Here you can send settings to backend or save locally
    setMessage("✅ Settings saved successfully");
  };

  return (
    <div className="container mt-4">
      <h2>General Settings</h2>
      <form onSubmit={handleSave}>
        <div className="mb-3">
          <label>Theme:</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="form-control"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="mb-3">
          <label>Layout:</label>
          <select
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
            className="form-control"
          >
            <option value="standard">Standard</option>
            <option value="compact">Compact</option>
          </select>
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
            id="notificationsCheck"
          />
          <label className="form-check-label" htmlFor="notificationsCheck">
            Enable Notifications
          </label>
        </div>

        <button type="submit" className="btn btn-success">Save Settings</button>
      </form>

      {message && <p className="mt-3">{message}</p>}
    </div>
  );
};

export default SettingsPage;
