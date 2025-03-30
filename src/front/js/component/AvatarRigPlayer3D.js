// AvatarRigPlayer3D.js (updated to support loading JSON sessions, full mesh, and bone transforms)
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';

const AvatarRig = ({ recordedFrames, avatarUrl }) => {
  const avatarRef = useRef();
  const frameIndex = useRef(0);
  const clock = useRef(new THREE.Clock());

  const gltf = useLoader(GLTFLoader, avatarUrl);
  const skinnedMesh = SkeletonUtils.clone(gltf.scene);

  useEffect(() => {
    if (avatarRef.current && skinnedMesh) {
      avatarRef.current.add(skinnedMesh);
    }
  }, [skinnedMesh]);

  useFrame(() => {
    if (!recordedFrames || recordedFrames.length === 0) return;
    frameIndex.current += 1;
    if (frameIndex.current >= recordedFrames.length) frameIndex.current = 0;

    const frame = recordedFrames[frameIndex.current];

    // Map pose landmarks to bone transforms
    frame.landmarks.forEach((landmark, i) => {
      const boneName = mapIndexToBoneName(i);
      const bone = skinnedMesh.getObjectByName(boneName);
      if (bone) {
        bone.position.set(landmark.x, -landmark.y, -landmark.z);
      }
    });
  });

  return <group ref={avatarRef} />;
};

// Map MediaPipe landmark index to bone name (you can customize this mapping)
const mapIndexToBoneName = (index) => {
  const map = {
    11: 'LeftShoulder',
    12: 'RightShoulder',
    13: 'LeftElbow',
    14: 'RightElbow',
    15: 'LeftWrist',
    16: 'RightWrist',
    23: 'LeftHip',
    24: 'RightHip',
    25: 'LeftKnee',
    26: 'RightKnee',
    27: 'LeftAnkle',
    28: 'RightAnkle',
  };
  return map[index] || null;
};

const AvatarRigPlayer3D = ({ recordedFrames, avatarUrl }) => {
  return (
    <Canvas camera={{ position: [0, 1.5, 3] }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <AvatarRig recordedFrames={recordedFrames} avatarUrl={avatarUrl} />
    </Canvas>
  );
};

export default AvatarRigPlayer3D;