import React from 'react';

const AvatarRigging = ({ avatarUrl }) => {
  const handleRig = () => {
    alert(`Rigging avatar at ${avatarUrl}...`);
    // Implement connection to rigging service here
  };

  return (
    <div>
      <button onClick={handleRig}>Apply Rig</button>
    </div>
  );
};

export default AvatarRigging;
