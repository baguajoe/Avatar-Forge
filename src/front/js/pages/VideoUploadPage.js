import React, { useState } from 'react';

const VideoUploadPage = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file change
  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  // Handle video upload
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
      } else {
        alert("Error processing video.");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("An error occurred during video upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload Video for Pose Tracking</h2>
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
          <h3>Pose Data</h3>
          <p>{JSON.stringify(poseData, null, 2)}</p>
        </div>
      )}
    </div>
  );
};

export default VideoUploadPage;
