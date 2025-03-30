import React, { useRef, useEffect, useImperativeHandle } from "react";


const AnimatedAvatar = React.forwardRef(({ style }, ref) => {
  const mouthRef = useRef();  // Mouth mesh reference for animation control
  const actions = useRef({});  // Store animations (if using 3D animation library)

  // Function to animate mouth based on viseme
  const animateMouth = (viseme) => {
    const mouthShape = visemeMap[viseme] || "mouth_idle";  // Default to idle if no match
    if (mouthRef.current) {
      // Trigger animation change for mouth
      mouthRef.current.setAnimation(mouthShape);
    }
  };

  React.useImperativeHandle(ref, () => ({
    animateMouth,  // Make this available for external use
  }));

  return (
    <group>
      {/* Your 3D avatar components */}
      <mesh ref={mouthRef} name="mouth">
        {/* Add your mouth animation or blendshape controls here */}
      </mesh>
    </group>
  );
});

export default AnimatedAvatar;
