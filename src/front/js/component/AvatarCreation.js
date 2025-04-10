// /src/components/AvatarCreation.js
import React, { useState } from 'react';

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
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/create-avatar`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Error uploading image');
      }

      const data = await res.json();
      onAvatarCreated(data.avatar_url);
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
