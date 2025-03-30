import React, { useState, useEffect } from 'react';
import PoseVisualization from '../component/PoseVisualization';

const AvatarWithPosePage = () => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [poseData, setPoseData] = useState(null);

  // Simulating fetching pose data from a video upload (use real fetch logic)
  useEffect(() => {
    // Example: Fetch pose data from an API or props
    const fetchedPoseData = { landmarks: "example_pose_data" }; // Replace with actual data
    setPoseData(fetchedPoseData);

    // Example: Fetch avatar URL (could be a result from API like Deep3D)
    const fetchedAvatarUrl = 'https://example.com/avatar.png'; // Replace with the actual avatar URL
    setAvatarUrl(fetchedAvatarUrl);
  }, []);

  return (
    <div>
      <h2>Avatar with Pose</h2>
      {avatarUrl && <img src={avatarUrl} alt="Avatar" />}
      {poseData && <PoseVisualization poseData={poseData} />}
    </div>
  );
};

export default AvatarWithPosePage;
