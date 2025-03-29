// /src/components/AvatarCreation.js
import React, { useState } from 'react';
import axios from 'axios';

const AvatarCreation = ({ onAvatarCreated }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert('Please select an image.');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('user_id', 1); // Replace with dynamic user ID
    setIsLoading(true);

    try {
      const res = await axios.post('/api/create-avatar', formData);
      onAvatarCreated(res.data.avatar_url);
    } catch (err) {
      alert('Error uploading image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Avatar'}
      </button>
    </div>
  );
};

export default AvatarCreation;