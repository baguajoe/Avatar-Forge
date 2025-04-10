// AvatarRigPlayer3D.js
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';

const AvatarRig = ({ recordedFrames, avatarUrl }) => {
  const avatarRef = useRef();
  const frameIndex = useRef(0);
  const skinnedMeshRef = useRef();
  const clock = useRef(new THREE.Clock());

  const gltf = useLoader(GLTFLoader, avatarUrl);
  const skinnedMesh = SkeletonUtils.clone(gltf.scene);

  useEffect(() => {
    if (avatarRef.current && skinnedMesh) {
      avatarRef.current.add(skinnedMesh);
      skinnedMeshRef.current = skinnedMesh;

      // 🟤 Add eyes
      const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
      const eyeGeo = new THREE.SphereGeometry(0.03, 32, 32);
      const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
      leftEye.name = "LeftEye"; rightEye.name = "RightEye";

      leftEye.position.set(0.03, 1.58, 0.08);
      rightEye.position.set(-0.03, 1.58, 0.08);
      skinnedMesh.add(leftEye);
      skinnedMesh.add(rightEye);
    }
  }, [skinnedMesh]);

  useFrame(() => {
    if (!recordedFrames || recordedFrames.length === 0 || !skinnedMeshRef.current) return;

    frameIndex.current += 1;
    if (frameIndex.current >= recordedFrames.length) frameIndex.current = 0;

    const frame = recordedFrames[frameIndex.current];

    // 🎮 Apply landmark data to bones
    frame.landmarks.forEach((lm, i) => {
      const boneName = mapIndexToBoneName(i);
      const bone = skinnedMeshRef.current.getObjectByName(boneName);
      if (bone) {
        bone.position.set(lm.x, -lm.y, -lm.z);
      }
    });

    // 👄 Optional: Animate jaw (if index 0 is mouth or mic amplitude)
    const jaw = skinnedMeshRef.current.getObjectByName("Jaw");
    if (jaw && frame.jawOpen !== undefined) {
      jaw.rotation.x = THREE.MathUtils.lerp(jaw.rotation.x, frame.jawOpen, 0.2);
    }
  });

  return <group ref={avatarRef} />;
};

// Map MediaPipe indices to bone names in your rig
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
    0: 'Jaw', // optional mapping if frame has jawOpen amplitude
  };
  return map[index] || null;
};

const AvatarRigPlayer3D = ({ recordedFrames, avatarUrl }) => {
  return (
    <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 5]} intensity={1} />
      <AvatarRig recordedFrames={recordedFrames} avatarUrl={avatarUrl} />
    </Canvas>
  );
};

export default AvatarRigPlayer3D;
