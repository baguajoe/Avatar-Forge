// RigAvatarPage.js
import React, { useState } from 'react';
import { applyRigToAvatar } from '../utils/riggingUtils';

const RigAvatarPage = ({ avatarUrl }) => {
  const [riggedUrl, setRiggedUrl] = useState(null);

  const handleRigging = async () => {
    const result = await applyRigToAvatar(avatarUrl);
    setRiggedUrl(result);
  };

  return (
    <div>
      <h2>Rig Avatar</h2>
      <button onClick={handleRigging}>Apply Rig</button>
      {riggedUrl && <p>Rigged Avatar URL: {riggedUrl}</p>}
    </div>
  );
};

export default RigAvatarPage;
