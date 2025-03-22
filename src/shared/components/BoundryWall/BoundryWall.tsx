import React from 'react';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

interface BoundaryWallProps {
  position: [number, number, number];
  scale: [number, number, number];
  transparent: boolean;
  mario?: boolean; // If true, adjust axis (e.g., rotate the wall)
  propRotation?: [number, number,number]
}

const BoundaryWall: React.FC<BoundaryWallProps> = ({ position, scale, transparent, mario = false ,propRotation}) => {
  // When mario is true, we rotate the wall 90 degrees around Y.
  const rotation: [number, number, number] = mario ? [0, -Math.PI / 3, 0] : propRotation ? propRotation : [0,0,0];
  // Create a static physics body for the wall.
  const [ref] = useBox(() => ({
    type: 'Static',
    mass: 100,
    position,
    args: scale, // the collision box dimensions
    userData: {
      type: "boundryWall"
    }
  }));

  return (
    <mesh ref={ref} position={position} rotation={rotation}  receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial
        color="blue"
        transparent={transparent}
        opacity={transparent ? 0 : 1}
      />
    </mesh>
  );
};

export default BoundaryWall;
