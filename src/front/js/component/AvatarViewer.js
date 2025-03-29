import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';

const AvatarModel = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

const AvatarViewer = ({ modelUrl }) => (
  <Canvas style={{ height: '500px' }}>
    <Suspense fallback={null}>
      <ambientLight intensity={0.5} />
      <Environment preset="sunset" />
      <AvatarModel url={modelUrl} />
      <OrbitControls />
    </Suspense>
  </Canvas>
);

export default AvatarViewer;
