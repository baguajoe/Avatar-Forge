import React, { useState } from 'react';

const AvatarExportPage = () => {
  const [rigType, setRigType] = useState("unity");  // Unity or Unreal or Maya
  const [fileType, setFileType] = useState("fbx");  // Default to FBX

  const avatarModelUrl = "/path/to/avatar/model.glb";  // Path to the avatar model

  // Function to handle export logic
  const handleExport = async (rigType, fileType) => {
    const riggingPreset = rigType === "unity" ? "UnityHumanoid" 
                        : rigType === "unreal" ? "UnrealSkeleton" 
                        : "maya";
    
    const exportData = {
      riggingPreset,
      avatarModel: avatarModelUrl,
      boneStructure: riggingPreset,
      fileType: fileType,  // Send the requested file type (fbx, glb, obj)
    };

    // Fetch the export from the backend API
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/export-avatar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exportData),
    });

    // Handle the response and download the file
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `avatar_${riggingPreset}.${fileType}`;  // Adjust download name based on file type
    a.click();
  };

  return (
    <div>
      <h2>Export Avatar</h2>

      {/* Export Options */}
      <div>
        <label>Rigging Type:</label>
        <select onChange={(e) => setRigType(e.target.value)} value={rigType}>
          <option value="unity">Unity Humanoid</option>
          <option value="unreal">Unreal Skeleton</option>
          <option value="maya">Maya</option>
        </select>
      </div>

      <div>
        <label>File Type:</label>
        <select onChange={(e) => setFileType(e.target.value)} value={fileType}>
          <option value="fbx">FBX</option>
          <option value="glb">GLTF</option>
          <option value="obj">OBJ</option>
        </select>
      </div>

      <button onClick={() => handleExport(rigType, fileType)}>Export Avatar</button>
    </div>
  );
};

export default AvatarExportPage;
