// src/components/ClothingDetector.js
import React, { useState } from "react";

const ClothingDetector = ({ onCaptionReady }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setCaption("");

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("image", selectedImage);

    setLoading(true);
    try {
      const res = await fetch("https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_HUGGINGFACE_API_KEY}`,
        },
        body: selectedImage, // Send raw file, not FormData for HuggingFace
      });

      const data = await res.json();
      if (data && data[0]?.generated_text) {
        setCaption(data[0].generated_text);
        if (onCaptionReady) onCaptionReady(data[0].generated_text);
      } else {
        setCaption("❌ No description found.");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setCaption("Error analyzing image.");
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h4>👗 Upload a Picture to Detect Clothing Style</h4>
      <input type="file" accept="image/*" onChange={handleImageChange} className="form-control" />

      {previewUrl && (
        <>
          <img src={previewUrl} alt="Preview" style={{ width: "300px", marginTop: "10px" }} />
          <button className="btn btn-primary mt-2" onClick={handleSubmit} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Image"}
          </button>
        </>
      )}

      {caption && <p className="mt-3">🧠 Detected Style: <strong>{caption}</strong></p>}
    </div>
  );
};

export default ClothingDetector;
