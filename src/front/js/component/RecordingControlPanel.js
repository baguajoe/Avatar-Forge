import React from "react";

const RecordingControlPanel = ({
  recordingVideo,
  onToggleVideoRecording,
  onExportPose,
  onUploadPose,
  saveStatus,
}) => {
  return (
    <div className="mt-3 d-flex gap-2 flex-wrap">
      <button
        className={`btn ${recordingVideo ? "btn-danger" : "btn-primary"}`}
        onClick={onToggleVideoRecording}
      >
        {recordingVideo ? "⏹ Stop Recording" : "⏺ Start Video Recording"}
      </button>

      <button className="btn btn-success" onClick={onExportPose}>
        📥 Download Pose Data
      </button>

      <button className="btn btn-warning" onClick={onUploadPose}>
        ⬆️ Upload to Backend
      </button>

      {saveStatus && (
        <p className="mt-2 mb-0 text-info fw-medium">{saveStatus}</p>
      )}
    </div>
  );
};

export default RecordingControlPanel;
