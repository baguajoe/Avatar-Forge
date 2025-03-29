import React, { useState } from 'react';

const AvatarCustomizer = ({ onCustomize }) => {
  const [skinColor, setSkinColor] = useState('#f5cba7');
  const [outfitColor, setOutfitColor] = useState('#3498db');

  const handleSave = () => {
    onCustomize({
      skin_color: skinColor,
      outfit_color: outfitColor,
      accessories: 'glasses',
    });
  };

  return (
    <div>
      <label>Skin Color:</label>
      <input type="color" value={skinColor} onChange={(e) => setSkinColor(e.target.value)} />
      <label>Outfit Color:</label>
      <input type="color" value={outfitColor} onChange={(e) => setOutfitColor(e.target.value)} />
      <button onClick={handleSave}>Save Customization</button>
    </div>
  );
};

export default AvatarCustomizer;
