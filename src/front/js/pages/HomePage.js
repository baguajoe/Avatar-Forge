
// HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => (
  <div>
    <h1>Welcome to the Avatar Creator</h1>
    <nav>
      <ul>
        <li><Link to="/upload">Upload Photo</Link></li>
        <li><Link to="/customize">Customize Avatar</Link></li>
        <li><Link to="/rig">Rig Avatar</Link></li>
        <li><Link to="/motion">Motion Capture</Link></li>
      </ul>
    </nav>
  </div>
);

export default HomePage;