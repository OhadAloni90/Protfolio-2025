import React, { useRef, useState } from 'react';
import { useBox } from '@react-three/cannon';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import VerticalSurface from '../VerticalSurface/VerticalSurface';
import './DestructibleWall.scss';
export interface DestructibleWallProps {
  width?: number;
  height?: number;
  color?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  onDestroy?: () => void;
}

const DestructibleWall: React.FC<DestructibleWallProps> = ({
  width = 8,
  height = 8,
  color = 'pink',
  position,
  rotation = [0, 0, 0],
  onDestroy,
}) => {
  // Local state to determine if the wall is destroyed.
  const [destroyed, setDestroyed] = useState(false);

  // Create a physics collider for the wall as a thin box.
  // Tag it as "vertical" so collisions can be distinguished.
  const [ref] = useBox(() => ({
    mass: 0,
    position,
    rotation,
    args: [width, height, 0.2], // a thin wall
    userData: { type: 'vertical' },
  }));

  // Handler to destroy the wall.
  const handleDestroy = () => {
    setDestroyed(true);
    if (onDestroy) onDestroy();
  };

  if (destroyed) return null;

  return (
    <>
      {/* Render the wall using your VerticalSurface for visual appearance */}
      <VerticalSurface
        width={width}
        height={height}
        color={color}
        position={position}
        rotation={rotation}
        colliderThickness={0.2}
      >
        {/* Optionally, you can place additional content on the wall here */}
      </VerticalSurface>

      {/* Overlay an interactive HTML button that triggers wall destruction.
          Adjust the position relative to the wall as needed. */}
      <Html transform position={[position[0], position[1] - height / 2 + 1, position[2] + 0.11]} center>
        <button
          className="destruct-button"
          onClick={(e) => {
            e.stopPropagation();
            handleDestroy();
          }}
        >
          Destroy Wall
        </button>
      </Html>
    </>
  );
};

export default DestructibleWall;
