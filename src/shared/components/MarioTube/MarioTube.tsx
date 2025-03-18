import React from "react";
import { useCylinder } from "@react-three/cannon";
import * as THREE from "three";

interface MarioTubeProps {
  position?: [number, number, number];
  onEnter: () => void;
}

const MarioTube: React.FC<MarioTubeProps> = ({ position = [5, 0, 0], onEnter }) => {
  // Create a static cylinder collider for the tube.
  const [ref] = useCylinder(() => ({
    type: "Static",
    args: [1.3, 1.3, 2, 32], // radiusTop, radiusBottom, height, radialSegments
    position,
    rotation: [0, 0, 0],
    // When any body collides with this tube, we check if it's the head.
    onCollide: (e) => {
    //     console.log('e',e)
    //   if (e.body.userData?.type === "head") {
    //     onEnter();
    //   }
    },
    userData: { type: "tube" },
  }));

  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[1.5, 1.5, 4, 32, 1, true]} />
      <meshStandardMaterial color="green" side={THREE.DoubleSide} />
    </mesh>
  );
};

export default MarioTube;
