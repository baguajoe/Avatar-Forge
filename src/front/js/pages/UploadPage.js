import React, { useState } from 'react';
import AvatarCreation from '../component/AvatarCreation';
import AvatarViewer from '../component/AvatarViewer';

const UploadPage = () => {
  const [avatarUrl, setAvatarUrl] = useState(null);

  return (
    <div>
      <h2>Upload Your Photo</h2>
      <AvatarCreation onAvatarCreated={setAvatarUrl} />
      {avatarUrl && <AvatarViewer modelUrl={avatarUrl} />}
    </div>
  );
};

export default UploadPage;
