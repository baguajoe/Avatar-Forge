// src/components/AvatarPreview.js
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const AvatarModel = () => {
  const { scene } = useGLTF("/models/base/avatar.glb"); // Adjust path if needed
  return <primitive object={scene} scale={1.5} />;
};

const OutfitModel = ({ file }) => {
  const { scene } = useGLTF(`/models/outfits/${file}`);
  return <primitive object={scene} scale={1.5} position={[0, 0, 0]} />;
};

const AvatarPreview = ({ outfitFile }) => {
  if (!outfitFile) return null;

  return (
    <div className="border mt-3" style={{ width: "100%", height: "400px" }}>
      <Canvas camera={{ position: [0, 1.5, 3] }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[0, 5, 5]} intensity={0.6} />

        <Suspense fallback={null}>
          <AvatarModel />
          <OutfitModel file={outfitFile} />
        </Suspense>

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
};

export default AvatarPreview;
