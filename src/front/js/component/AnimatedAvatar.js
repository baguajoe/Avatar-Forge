import React, { useRef, useEffect, useState, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useMicLoudness from "./useMicLoudness";

const AnimatedAvatar = forwardRef(({ style = "bounce" }, ref) => {
  const meshRef = useRef();
  const jawBone = useRef();
  const armL = useRef();
  const armR = useRef();
  const legL = useRef();
  const legR = useRef();
  const volume = useMicLoudness();

  const [moveArmL, setMoveArmL] = useState(false);
  const [moveArmR, setMoveArmR] = useState(false);

  // 🎹 Arm keypress controls
  useEffect(() => {
    const down = (e) => {
      if (e.key === "a") setMoveArmL(true);
      if (e.key === "d") setMoveArmR(true);
    };
    const up = (e) => {
      if (e.key === "a") setMoveArmL(false);
      if (e.key === "d") setMoveArmR(false);
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // 🦴 Build bones and skinned mesh
  useEffect(() => {
    if (!meshRef.current) return;

    // Bones
    const spine = new THREE.Bone();
    spine.name = "Spine";
    spine.position.y = 0.5;

    const head = new THREE.Bone();
    head.name = "Head";
    head.position.y = 1.2;

    const jaw = new THREE.Bone();
    jaw.name = "Jaw";
    jaw.position.y = -0.3;
    jawBone.current = jaw;

    const leftArm = new THREE.Bone();
    leftArm.name = "ArmL";
    leftArm.position.set(-0.7, 0.8, 0);
    armL.current = leftArm;

    const rightArm = new THREE.Bone();
    rightArm.name = "ArmR";
    rightArm.position.set(0.7, 0.8, 0);
    armR.current = rightArm;

    const leftLeg = new THREE.Bone();
    leftLeg.name = "LegL";
    leftLeg.position.set(-0.3, -1, 0);
    legL.current = leftLeg;

    const rightLeg = new THREE.Bone();
    rightLeg.name = "LegR";
    rightLeg.position.set(0.3, -1, 0);
    legR.current = rightLeg;

    // Build bone hierarchy
    spine.add(head);
    head.add(jaw);
    spine.add(leftArm, rightArm, leftLeg, rightLeg);

    const skeleton = new THREE.Skeleton([
      spine,
      head,
      jaw,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
    ]);

    // Geometry
    const geometry = new THREE.BoxGeometry(1, 2, 0.5);
    const skinIndices = [];
    const skinWeights = [];

    for (let i = 0; i < geometry.attributes.position.count; i++) {
      skinIndices.push(0, 0, 0, 0);
      skinWeights.push(1, 0, 0, 0);
    }

    geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndices, 4));
    geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));

    const material = new THREE.MeshStandardMaterial({
      color: "orange",
      skinning: true,
    });

    const skinnedMesh = new THREE.SkinnedMesh(geometry, material);
    skinnedMesh.add(spine);
    skinnedMesh.bind(skeleton);

    meshRef.current.add(skinnedMesh);
  }, []);

  // 🌀 Animate bones per frame
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (jawBone.current) {
      jawBone.current.rotation.x = Math.min(volume * 1.5, 0.5);
    }

    if (armL.current && armR.current) {
      if (style === "arms") {
        armL.current.rotation.z = Math.sin(t * 2) * 0.5;
        armR.current.rotation.z = Math.sin(t * 2) * -0.5;
      } else if (style === "freestyle") {
        armL.current.rotation.z = Math.sin(t * 3) * 0.5;
        armR.current.rotation.z = Math.cos(t * 2.5) * -0.5;
        armL.current.rotation.x = Math.sin(t * 2) * 0.3;
        armR.current.rotation.x = Math.cos(t * 1.8) * 0.3;
      } else {
        armL.current.rotation.z = moveArmL ? Math.sin(t * 4) * 0.5 : 0;
        armR.current.rotation.z = moveArmR ? Math.sin(t * 4) * -0.5 : 0;
      }
    }

    if (legL.current && legR.current) {
      if (style === "bounce") {
        const bounce = Math.sin(t * 2) * 0.1;
        legL.current.rotation.x = bounce;
        legR.current.rotation.x = -bounce;
      } else if (style === "shuffle") {
        legL.current.rotation.z = Math.sin(t * 5) * 0.2;
        legR.current.rotation.z = -Math.sin(t * 5) * 0.2;
        legL.current.rotation.x = Math.cos(t * 2.5) * 0.1;
        legR.current.rotation.x = -Math.cos(t * 2.5) * 0.1;
      }
    }
  });

  // 📦 Expose animate method
  useEffect(() => {
    if (ref) {
      ref.current = {
        animate: () => {
          if (jawBone.current) {
            jawBone.current.rotation.x = 0.4;
            setTimeout(() => {
              jawBone.current.rotation.x = 0;
            }, 150);
          }

          if (armL.current && armR.current && (style === "arms" || style === "freestyle")) {
            const originalL = armL.current.rotation.z;
            const originalR = armR.current.rotation.z;
            armL.current.rotation.z = 0.4;
            armR.current.rotation.z = -0.4;
            setTimeout(() => {
              armL.current.rotation.z = originalL;
              armR.current.rotation.z = originalR;
            }, 200);
          }

          if (legL.current && legR.current && (style === "bounce" || style === "shuffle")) {
            const originalL = legL.current.rotation.x;
            const originalR = legR.current.rotation.x;
            legL.current.rotation.x = 0.2;
            legR.current.rotation.x = -0.2;
            setTimeout(() => {
              legL.current.rotation.x = originalL;
              legR.current.rotation.x = originalR;
            }, 200);
          }
        },
      };
    }
  }, [ref, style]);

  return <group ref={meshRef} />;
});

export default AnimatedAvatar;
