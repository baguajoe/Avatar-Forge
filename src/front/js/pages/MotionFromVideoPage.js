import React, { useState } from 'react';
import MotionFromVideo from '../component/MotionFromVideo';

const MotionFromVideoPage = () => {
  const [videoUrl, setVideoUrl] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  return (
    <div>
      <h2>Motion Capture from Video</h2>
      <input type="file" accept="video/*" onChange={handleFileUpload} />
      {videoUrl && <MotionFromVideo videoUrl={videoUrl} />}
    </div>
  );
};

export default MotionFromVideoPage;
