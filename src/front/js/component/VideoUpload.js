import React, { useState } from 'react';

const VideoUpload = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!videoFile) {
      alert("Please select a video to upload.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const res = await fetch('/upload-video', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.pose_data_file) {
        setPoseData(data.pose_data_file);
        alert("Video processed successfully!");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload Video for MoCap</h2>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
      />
      <button
        onClick={handleUpload}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload Video'}
      </button>
      
      {poseData && (
        <div>
          <h3>Pose Data File</h3>
          <p>{poseData}</p>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
