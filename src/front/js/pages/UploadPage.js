import React, { useState } from 'react';
import AvatarUpload from '../component/AvatarUpload';
import AvatarViewer from '../component/AvatarViewer';
import FaceDetectionPreview from '../component/FaceDetectionPreview';
import '../../styles/UploadPage.css';

const UploadPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [facePreviewUrl, setFacePreviewUrl] = useState(null);
  const [faceMeshUrl, setFaceMeshUrl] = useState(null);
  const [meshApproved, setMeshApproved] = useState(false);
  const [fullAvatarUrl, setFullAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const getCurrentStep = () => {
    if (!facePreviewUrl) return 0;
    if (!faceMeshUrl) return 1;
    if (!meshApproved) return 2;
    return 3;
  };

  const handleUploadComplete = (previewUrl, file) => {
    setFacePreviewUrl(previewUrl);
    setUploadedFile(file);
    setFaceMeshUrl(null);
    setMeshApproved(false);
    setFullAvatarUrl(null);
    showToast("✅ Face uploaded successfully");
  };

  const handleGenerateMesh = async () => {
    if (!uploadedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', uploadedFile);

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate-avatar`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json(); // ⬅️ Get the JSON response
      const url = `${process.env.REACT_APP_BACKEND_URL}${data.avatar_model_url}`;
      setFaceMeshUrl(url);
      showToast("Face mesh generated successfully");
    } catch (err) {
      console.error(err);
      alert("Mesh generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFullAvatar = async () => {
    if (!uploadedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', uploadedFile);

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/generate-full-avatar`, {
        method: 'POST',
        body: formData,
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setFullAvatarUrl(url);
      showToast("🧍 Full avatar generated successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Full avatar generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Upload", "Mesh", "Approve", "Avatar"];

  return (
    <div className="upload-container">
      {/* Toast Notification */}
      {toast && <div className="toast-message">{toast}</div>}

      {/* Progress Bar */}
      <div className="progress-bar">
        {stepLabels.map((label, index) => (
          <div key={index} className="progress-step-container">
            <div className={`progress-step ${getCurrentStep() >= index ? 'active' : ''}`}></div>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>

      <h2 className="step-title">Step 1: Upload + Face Detection</h2>

      {!facePreviewUrl && (
        <AvatarUpload onUploadComplete={handleUploadComplete} />
      )}

      {facePreviewUrl && (
        <div className="preview-section">
          <FaceDetectionPreview imageUrl={facePreviewUrl} />
          <button onClick={() => setFacePreviewUrl(null)} className="btn-secondary" aria-label="Re-upload Photo">
            🔁 Re-upload
          </button>
        </div>
      )}

      {uploadedFile && facePreviewUrl && !faceMeshUrl && (
        <div className="mesh-section">
          <h2 className="step-title">Step 2: Convert Face to Mesh</h2>
          <p>This analyzes your image and builds a 3D mesh from it.</p>
          <button
            onClick={handleGenerateMesh}
            className="btn-primary"
            disabled={loading}
            aria-label="Generate Face Mesh"
            style={{ marginTop: '10px', padding: '10px 20px', fontSize: '16px' }}
          >
            {loading ? "⏳ Generating Mesh..." : "🧠 Convert Face to Mesh"}
          </button>
          {loading && <div className="skeleton-loader" />}
        </div>
      )}

      {faceMeshUrl && (
        <div className="mesh-preview">
          <h3>Face Mesh Preview</h3>
          {loading ? <div className="skeleton-loader" /> : <AvatarViewer modelUrl={faceMeshUrl} />}
          <div className="action-buttons">
            <button onClick={() => setMeshApproved(true)} className="btn-primary" aria-label="Approve Face Mesh">
              ✅ Looks Good → Continue
            </button>
            <button onClick={() => setFaceMeshUrl(null)} className="btn-secondary" aria-label="Try Again">
              🔄 Try Again
            </button>
          </div>
        </div>
      )}

      {meshApproved && (
        <div className="avatar-generation">
          <h2 className="step-title">Step 3: Create Full Avatar</h2>
          <button
            onClick={handleGenerateFullAvatar}
            className="btn-primary"
            disabled={loading}
            aria-label="Generate Full Avatar"
          >
            {loading ? "🛠️ Generating Avatar..." : "🧍 Build Full Avatar"}
          </button>
          {loading && <div className="skeleton-loader" />}
        </div>
      )}

      {fullAvatarUrl && (
        <div className="final-avatar">
          <h3>Your Full Avatar</h3>
          {loading ? <div className="skeleton-loader" /> : <AvatarViewer modelUrl={fullAvatarUrl} />}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
