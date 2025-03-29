// CustomizePage.js
import React from 'react';
import AvatarCustomizer from '../component/AvatarCustomizer';

const CustomizePage = ({ avatarId }) => {
  const handleCustomization = (customization) => {
    // TODO: Send customization to backend using avatarId
    console.log('Customization saved:', customization);
  };

  return (
    <div>
      <h2>Customize Avatar</h2>
      <AvatarCustomizer onCustomize={handleCustomization} />
    </div>
  );
};

export default CustomizePage;
