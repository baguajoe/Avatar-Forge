
// ProfilePage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AvatarViewer from '../component/AvatarViewer';

const ProfilePage = ({ userId }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      const res = await axios.get(`/api/get-avatar/${userId}`);
      setAvatarUrl(res.data.avatar_url);
    };
    fetchAvatar();
  }, [userId]);

  return (
    <div>
      <h2>Your Profile</h2>
      {avatarUrl ? <AvatarViewer modelUrl={avatarUrl} /> : <p>Loading avatar...</p>}
    </div>
  );
};

export default ProfilePage;
