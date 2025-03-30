// Layout.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './component/sidebar';
import Navbar from './component/navbar';

import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import CustomizePage from './pages/CustomizePage';
import RigAvatarPage from './pages/RigAvatarPage';
import MotionCapturePage from './pages/MotionCapturePage';
import ProfilePage from './pages/ProfilePage';
import ErrorPage from './pages/ErrorPage';
import MotionFromVideoPage from './pages/MotionFromVideoPage';
import DanceSyncPage from './pages/DanceSyncPage';
import AvatarWithPosePage from './pages/AvatarWithPosePage';
import Login from './pages/LoginPage';
import Signup from './pages/SignupPage';

const Layout = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="d-flex">
        <Sidebar />

        <div className="flex-grow-1 p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/customize" element={<CustomizePage />} />
            <Route path="/rig" element={<RigAvatarPage />} />
            <Route path="/motion" element={<MotionCapturePage />} />
            <Route path="/motion-from-video" element={<MotionFromVideoPage />} />
            <Route path="/profile" element={<ProfilePage userId={1} />} />
            <Route path="/dance-sync" element={<DanceSyncPage />} />
            <Route path="/avatar-with-pose" element={<AvatarWithPosePage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
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