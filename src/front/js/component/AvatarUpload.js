// src/components/AvatarUpload.js
import React, { useState } from "react";
import axios from "axios";

const AvatarUpload = ({ onAvatarReady }) => {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!imageFile) return alert("Upload an image first!");

    setIsLoading(true);
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const res = await axios.post("https://deep3d-api-url/generate-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const avatarUrl = res.data.avatar_url;
      onAvatarReady(avatarUrl);
    } catch (err) {
      console.error(err);
      alert("Avatar generation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload a Photo</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && <img src={preview} alt="Preview" width={150} />}
      <br />
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Avatar"}
      </button>
    </div>
  );
};

export default AvatarUpload;
