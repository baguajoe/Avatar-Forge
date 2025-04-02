import React, { useState, useEffect } from 'react';

const AvatarCustomizer = ({ onCustomize }) => {
  const [height, setHeight] = useState(170); // Default height in cm
  const [weight, setWeight] = useState(70); // Default weight in kg
  const [skinColor, setSkinColor] = useState('#f5cba7');
  const [outfitColor, setOutfitColor] = useState('#3498db');
  const [accessories, setAccessories] = useState('glasses');
  const [modelUrl, setModelUrl] = useState('/rigged-avatar.glb'); // Default avatar model

  // Handle saving the customization data
  const handleSave = () => {
    onCustomize({
      height,
      weight,
      skin_color: skinColor,
      outfit_color: outfitColor,
      accessories,
      modelUrl,
    });
  };

  // Optional: Update the avatar customization when height or weight is modified
  useEffect(() => {
    // You can integrate avatar rigging logic here if necessary based on height, weight, etc.
  }, [height, weight]);

  return (
    <div>
      <h2>Customize Your Avatar</h2>

      {/* Height and Weight Inputs */}
      <div className="input-group">
        <label htmlFor="height">Height (cm):</label>
        <input
          type="number"
          id="height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          min="100"
          max="250"
        />
      </div>
      <div className="input-group">
        <label htmlFor="weight">Weight (kg):</label>
        <input
          type="number"
          id="weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          min="30"
          max="200"
        />
      </div>

      {/* Color Pickers */}
      <div className="input-group">
        <label htmlFor="skin-color">Skin Color:</label>
        <input
          type="color"
          id="skin-color"
          value={skinColor}
          onChange={(e) => setSkinColor(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="outfit-color">Outfit Color:</label>
        <input
          type="color"
          id="outfit-color"
          value={outfitColor}
          onChange={(e) => setOutfitColor(e.target.value)}
        />
      </div>

      {/* Accessories */}
      <div className="input-group">
        <label htmlFor="accessories">Choose Accessories:</label>
        <select
          id="accessories"
          value={accessories}
          onChange={(e) => setAccessories(e.target.value)}
        >
          <option value="glasses">Glasses</option>
          <option value="hat">Hat</option>
          <option value="necklace">Necklace</option>
        </select>
      </div>

      {/* Model Selection */}
      <div className="input-group">
        <label htmlFor="avatar-model">Select Avatar Model:</label>
        <select
          id="avatar-model"
          value={modelUrl}
          onChange={(e) => setModelUrl(e.target.value)}
        >
          <option value="/rigged-avatar.glb">Rigged Avatar</option>
          <option value="/alt-avatar.glb">Alternate Avatar</option>
          <option value="/dancer-avatar.glb">Dancer Avatar</option>
        </select>
      </div>

      {/* Save Button */}
      <button onClick={handleSave}>Save Customization</button>
    </div>
  );
};

export default AvatarCustomizer;
