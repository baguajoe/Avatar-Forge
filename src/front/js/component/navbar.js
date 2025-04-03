import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";

const Navbar = () => {
  const [authStatus, setAuthStatus] = useState(false);
  const { store, actions } = useContext(Context);

  useEffect(() => {
    const authUpdate = async () => {
      const isAuth = await actions.authenticate();
      setAuthStatus(isAuth);
    };
    authUpdate();
  }, []);

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

            {/* Always visible links */}
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
              <Link className="nav-link" to="/dance-sync">Dance Sync</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/stripe-pricing">Pricing</Link>
            </li>

            {/* Conditional Settings Dropdown */}
            {authStatus ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="settingsDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Settings
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="settingsDropdown">
                  <li>
                    <Link className="dropdown-item" to="/profile">Account Info</Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/account-settings">Account Settings</Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={actions.logout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">Signup</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
