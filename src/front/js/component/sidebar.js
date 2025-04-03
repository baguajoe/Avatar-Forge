// src/components/Sidebar.js
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="bg-light border-end" style={{ width: '250px', minHeight: '100vh' }}>
      <div className="sidebar-heading p-3 fw-bold border-bottom">
        Dashboard
      </div>
      <div className="list-group list-group-flush">
        <Link to="/" className="list-group-item list-group-item-action">Home</Link>
        <Link to="/upload" className="list-group-item list-group-item-action">Upload</Link>
        <Link to="/customize" className="list-group-item list-group-item-action">Customize</Link>
        <Link to="/rig" className="list-group-item list-group-item-action">Rig</Link>
        <Link to="/clothing-match" className="list-group-item list-group-item-action">Clothing Match</Link>
        <Link to="/motion" className="list-group-item list-group-item-action">Live Motion</Link>
        <Link to="/motion-from-video" className="list-group-item list-group-item-action">From Video</Link>
        <Link to="/dance-sync" className="list-group-item list-group-item-action">Dance Sync</Link>
        <Link to="/profile" className="list-group-item list-group-item-action">Profile</Link>
        <Link to="/beat-editor" className="list-group-item list-group-item-action">Beat Editor</Link>
        <Link to="/beatmap-editor" className="list-group-item list-group-item-action">BeatMap Editor</Link>
        <Link to="/motion-sessions" className="list-group-item list-group-item-action">All Sessions</Link>
        <Link to="/video-upload" className="list-group-item list-group-item-action">Video Upload</Link>
        <Link to="/stripe-pricing" className="list-group-item list-group-item-action">Pricing</Link>

      </div>
    </div>
  );
};

export default Sidebar;
