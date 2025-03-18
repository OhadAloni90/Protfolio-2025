import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface Arrow3DProps {
  text: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}

const Arrow3D: React.FC<Arrow3DProps> = ({
  text,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = 'black'
}) => {
  // Parameters for the arrow geometry
  const shaftLength = 2;
  const shaftRadius = 0.05;
  const headLength = 0.5;
  const headRadius = 0.15;

  return (
    <group position={position} rotation={rotation}>
      {/* Shaft: a cylinder, positioned so that its base is at the origin */}
      <mesh position={[0, shaftLength / 2, 0]}>
        <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Arrow head: a cone, positioned on top of the shaft */}
      <mesh position={[0, shaftLength + headLength / 2, 0]}>
        <coneGeometry args={[headRadius, headLength, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Text: rendered above the arrow head */}
      <Text
        position={[0, shaftLength + headLength + 0.2, 0]}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="bottom"
      >
        {text}
      </Text>
    </group>
  );
};

export default Arrow3D;
