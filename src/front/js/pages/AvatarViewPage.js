// UploadPage.js
import React, { useState } from 'react';
import AvatarCreation from '../component/AvatarCreation';
import AvatarViewer from '../component/AvatarViewer';


// AvatarViewPage.js
import React from 'react';
import AvatarViewer from '../components/AvatarViewer';

const AvatarViewPage = ({ avatarUrl }) => (
  <div>
    <h2>Your Avatar</h2>
    <AvatarViewer modelUrl={avatarUrl} />
  </div>
);

export default AvatarViewPage;
