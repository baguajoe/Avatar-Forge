/**
 * Processes landmark data from MediaPipe Pose and formats for animation.
 *
 * @param {Array} landmarks - MediaPipe landmark array
 * @returns {Object} - Simplified pose data or skeletal mapping
 */
export const processPoseData = (landmarks) => {
    if (!landmarks || landmarks.length === 0) return {};
  
    return landmarks.reduce((result, point, index) => {
      result[`landmark_${index}`] = {
        x: point.x,
        y: point.y,
        z: point.z,
        visibility: point.visibility,
      };
      return result;
    }, {});
  };
  
  /**
   * Example function to map pose data to animation logic.
   * Extend this to drive your avatar's bones in Three.js or GLTF format.
   */
  export const mapPoseToRig = (poseData, avatarRef) => {
    // Example: apply poseData.landmark_11 to avatar's left shoulder
    // (You'd need bone references from your 3D avatar model)
    console.log('Mapping pose to rig:', poseData);
  
    if (!avatarRef || !avatarRef.current) return;
  
    // Sample logic (pseudo)
    // avatarRef.current.skeleton.bones['LeftShoulder'].rotation.x = poseData.landmark_11.x;
  };
  