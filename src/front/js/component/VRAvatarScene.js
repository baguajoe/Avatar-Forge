import { XRCanvas, Hands, VRButton } from '@react-three/xr';
import { OrbitControls } from '@react-three/drei';
import { Avatar } from './Avatar';

export default function VRAvatarScene({ frames, modelUrl }) {
  return (
    <>
      <VRButton />
      <XRCanvas camera={{ position: [0, 1.5, 3] }}>
        <ambientLight />
        <directionalLight position={[2, 2, 2]} />
        <Avatar frames={frames} currentTime={0} modelUrl={modelUrl} />
        <Hands />
        <OrbitControls />
      </XRCanvas>
    </>
  );
}
