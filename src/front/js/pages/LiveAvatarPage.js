// src/front/js/pages/LiveAvatarPage.js
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { smoothPose } from "../utils/smoothPose";

const LiveAvatarPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [poseLandmarks, setPoseLandmarks] = useState([]);
  const [prevPoseLandmarks, setPrevPoseLandmarks] = useState([]);
  const rendererRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const avatarRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    camera.position.set(0, 1.6, 3);
    const controls = new OrbitControls(camera, renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load("/models/avatar.glb", (gltf) => {
      const avatar = gltf.scene;
      avatar.scale.set(1, 1, 1);
      avatar.position.y = 0;
      scene.add(avatar);
      avatarRef.current = avatar;
    });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const smoothed = smoothPose(prevPoseLandmarks, results.poseLandmarks, 0.4);
      setPrevPoseLandmarks(smoothed);
      setPoseLandmarks(smoothed);

      if (smoothed && avatarRef.current) {
        const avatar = avatarRef.current;
        const nose = smoothed[0];
        avatar.position.x = (nose.x - 0.5) * 2;
        avatar.position.y = (1 - nose.y) * 2;

        const mapBone = (name, from, to, multiplier = 5) => {
          const bone = avatar.getObjectByName(name);
          if (!bone) return;
          const vec = new THREE.Vector3(
            to.x - from.x,
            to.y - from.y,
            to.z - from.z
          );
          bone.rotation.x = -vec.y * multiplier;
          bone.rotation.y = vec.x * multiplier;
        };

        // LEFT ARM
        mapBone("LeftUpperArm", smoothed[11], smoothed[13]);
        mapBone("LeftLowerArm", smoothed[13], smoothed[15]);

        // RIGHT ARM
        mapBone("RightUpperArm", smoothed[12], smoothed[14]);
        mapBone("RightLowerArm", smoothed[14], smoothed[16]);

        // LEFT LEG
        mapBone("LeftUpperLeg", smoothed[23], smoothed[25]);
        mapBone("LeftLowerLeg", smoothed[25], smoothed[27]);

        // RIGHT LEG
        mapBone("RightUpperLeg", smoothed[24], smoothed[26]);
        mapBone("RightLowerLeg", smoothed[26], smoothed[28]);

        // HEAD/NECK (experimental)
        mapBone("Neck", smoothed[0], smoothed[7], 2);
        mapBone("Head", smoothed[7], smoothed[0], 2);
      }
    });

    if (video) {
      const camera = new Camera(video, {
        onFrame: async () => {
          await pose.send({ image: video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  return (
    <div className="container mt-4">
      <h2>🎥 Live Avatar Mode (Full Body)</h2>
      <p>Move in front of your webcam to animate your avatar's full body in real-time.</p>

      <video ref={videoRef} className="d-none" playsInline></video>
      <canvas ref={canvasRef} style={{ width: "100%", height: "500px" }} />
    </div>
  );
};

export default LiveAvatarPage;