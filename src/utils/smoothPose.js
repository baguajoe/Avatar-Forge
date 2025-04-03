// utils/smoothPose.js
export const smoothPose = (prevLandmarks, newLandmarks, smoothingFactor = 0.5) => {
    if (!prevLandmarks || prevLandmarks.length !== newLandmarks.length) return newLandmarks;
  
    return newLandmarks.map((newPoint, i) => ({
      x: prevLandmarks[i].x * (1 - smoothingFactor) + newPoint.x * smoothingFactor,
      y: prevLandmarks[i].y * (1 - smoothingFactor) + newPoint.y * smoothingFactor,
      z: prevLandmarks[i].z * (1 - smoothingFactor) + newPoint.z * smoothingFactor,
      visibility: newPoint.visibility
    }));
  };
  