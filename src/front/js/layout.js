import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import UploadPage from '../pages/UploadPage';
import CustomizePage from '../pages/CustomizePage';
import RigAvatarPage from '../pages/RigAvatarPage';
import MotionCapturePage from '../pages/MotionCapturePage';
import ProfilePage from '../pages/ProfilePage';
import ErrorPage from '../pages/ErrorPage';
import MotionFromVideoPage from '../pages/MotionFromVideoPage';

const Layout = () => {
  return (
    <BrowserRouter>
      <div className="d-flex">
        {/* Sidebar */}
        <div className="bg-light border-end" style={{ width: '250px', minHeight: '100vh' }}>
          <div className="sidebar-heading p-3 fw-bold border-bottom">Avatar Creator</div>
          <div className="list-group list-group-flush">
            <Link to="/" className="list-group-item list-group-item-action">Home</Link>
            <Link to="/upload" className="list-group-item list-group-item-action">Upload</Link>
            <Link to="/customize" className="list-group-item list-group-item-action">Customize</Link>
            <Link to="/rig" className="list-group-item list-group-item-action">Rig</Link>
            <Link to="/motion" className="list-group-item list-group-item-action">Live Motion</Link>
            <Link to="/motion-from-video" className="list-group-item list-group-item-action">From Video</Link>
            <Link to="/profile" className="list-group-item list-group-item-action">Profile</Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/customize" element={<CustomizePage />} />
            <Route path="/rig" element={<RigAvatarPage />} />
            <Route path="/motion" element={<MotionCapturePage />} />
            <Route path="/motion-from-video" element={<MotionFromVideoPage />} />
            <Route path="/profile" element={<ProfilePage userId={1} />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>

          <footer className="text-center mt-5 border-top pt-3">
            <p>© {new Date().getFullYear()} Avatar Creator</p>
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default Layout;
