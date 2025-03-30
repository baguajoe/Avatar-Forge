// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          Avatar Creator
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex gap-2">
            <li className="nav-item">
              <Link className="nav-link" to="/upload">Upload</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/customize">Customize</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/rig">Rig</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/motion">Live Motion</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile">Profile</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dance-sync">Dance Sync</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/motion-sessions">Sessions</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/beat-editor">Beat Editor</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/stripe-pricing">Pricing</Link>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
