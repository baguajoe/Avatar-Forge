// src/components/AvatarUpload.js
import React, { useState } from "react";

const AvatarUpload = ({ onUploadComplete }) => {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImageFile(file);
      setPreview(previewUrl);

      // ✅ Notify parent that upload is complete
      onUploadComplete(previewUrl, file);
    }
  };

  return (
    <div>
      <h2>Upload a Photo</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && <img src={preview} alt="Preview" width={150} />}
    </div>
  );
};

export default AvatarUpload;
