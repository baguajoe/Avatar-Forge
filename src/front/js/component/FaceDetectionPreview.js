// /src/component/FaceDetectionPreview.js
import React from 'react';

const FaceDetectionPreview = ({ imageUrl }) => {
  return (
    <div>
      <h4>Detected Face Preview</h4>
      <img src={imageUrl} alt="Detected Face" style={{ maxWidth: '100%' }} />
    </div>
  );
};

export default FaceDetectionPreview;
