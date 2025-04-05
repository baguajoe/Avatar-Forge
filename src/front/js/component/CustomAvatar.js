// src/component/CustomAvatar.js
import React, { useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const CustomAvatar = ({ url }) => {
  const gltf = useLoader(GLTFLoader, url);
  const avatarRef = useRef();
  return <primitive object={gltf.scene} ref={avatarRef} />;
};

export default CustomAvatar;
