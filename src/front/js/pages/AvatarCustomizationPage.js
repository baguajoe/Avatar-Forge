// src/pages/AvatarCustomizationPage.js
import React, { useState } from 'react';
import AvatarCustomizer from '../component/AvatarCustomizer';

const AvatarCustomizationPage = () => {
  const [customizedAvatar, setCustomizedAvatar] = useState(null);

  const handleCustomize = (customizations) => {
    // You can save this data to the backend
    console.log(customizations);
    setCustomizedAvatar(customizations); // Store the customized avatar data
  };

  return (
    <div>
      <h1>Customize Your Avatar</h1>

      <AvatarCustomizer onCustomize={handleCustomize} />

      {/* Optionally display the customized avatar */}
      {customizedAvatar && (
        <div>
          <h2>Your Customized Avatar</h2>
          <p>Height: {customizedAvatar.height} cm</p>
          <p>Weight: {customizedAvatar.weight} kg</p>
          <p>Skin Color: {customizedAvatar.skin_color}</p>
          <p>Outfit Color: {customizedAvatar.outfit_color}</p>
          <p>Accessories: {customizedAvatar.accessories}</p>
          {/* Display the avatar model here */}
          <img src={customizedAvatar.modelUrl} alt="Customized Avatar" />
        </div>
      )}
    </div>
  );
};

export default AvatarCustomizationPage;
