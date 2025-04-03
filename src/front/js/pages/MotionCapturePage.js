import React, { useRef, useState } from 'react';
import MotionCapture from '../component/MotionCapture';
import MotionCaptureWithRecording from '../component/MotionCaptureWithRecording';
import { usePoseSocket } from '../../hooks/usePoseSocket';
import { applyPoseToAvatar } from '../../../utils/poseToAvatarRig';

const MotionCapturePage = () => {
  const avatarRef = useRef(null);
  const [recordingMode, setRecordingMode] = useState(false);

  const { isConnected } = usePoseSocket(({ landmarks }) => {
    applyPoseToAvatar(landmarks, avatarRef.current);
  });

  return (
    <div>
      <h2>Live Motion Stream</h2>

      <button
        className="btn btn-primary mb-3"
        onClick={() => setRecordingMode(!recordingMode)}
      >
        {recordingMode ? '🛑 Stop Recording Mode' : '🎥 Enable Recording Mode'}
      </button>

      {!isConnected && (
        <div className="alert alert-warning">⚠️ Socket disconnected</div>
      )}

      {recordingMode ? (
        <MotionCaptureWithRecording avatarRef={avatarRef} />
      ) : (
        <MotionCapture avatarRef={avatarRef} />
      )}
    </div>
  );
};

export default MotionCapturePage;
