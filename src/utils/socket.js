import { io } from 'socket.io-client';
const socket = io(process.env.REACT_APP_BACKEND_WS_URL);
export default socket;

// In component
import socket from '../utils/socket';

pose.onResults((results) => {
  if (results.poseLandmarks) {
    socket.emit('pose-data', {
      user_id: userId,
      landmarks: results.poseLandmarks,
    });
  }
});

// In Three.js Avatar scene (listener)
socket.on('pose-data', ({ landmarks }) => {
  applyPoseToAvatar(landmarks, avatarRef.current);
});