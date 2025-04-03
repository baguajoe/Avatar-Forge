import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_BACKEND_WS_URL, {
  transports: ['websocket'],         // Force WebSocket protocol
  reconnectionAttempts: 5,           // Retry connection 5 times
  reconnectionDelay: 1000,           // 1s delay between attempts
  timeout: 10000,                    // 10s connection timeout
  autoConnect: true,                 // Connect immediately
});

// ✅ Optional debug logging — disable in production if needed
socket.on('connect', () => {
  console.log('✅ WebSocket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.warn('⚠️ WebSocket disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.error('❌ WebSocket connection error:', err.message);
});

export default socket;
