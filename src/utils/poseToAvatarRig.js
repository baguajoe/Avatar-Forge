export const applyPoseToAvatar = (landmarks, avatar) => {
    if (!avatar || !avatar.skeleton) return;
    const bones = avatar.skeleton.bones;
  
    // Example mapping:
    const shoulder = landmarks[11]; // LEFT shoulder
    bones.find(b => b.name === 'LeftShoulder').position.set(
      shoulder.x * scale,
      shoulder.y * scale,
      shoulder.z * scale
    );
    // Repeat for other bones...
  };
  