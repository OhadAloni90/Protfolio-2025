import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { DoubleSide } from 'three';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';
import "./VerticalSurface.scss";
import { playSound } from '../../utils/audioUtils';

export interface VerticalSurfaceProps {
  width?: number;
  height?: number;
  children: React.ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  colliderThickness: number;
  breakThreshold?: number;
  headRef?: React.RefObject<THREE.Group | null>;
  onExplode?: () => void;
}

const FragmentPiece: React.FC<{
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}> = ({ position, size, color }) => {
  const [ref, api] = useBox(() => ({
    mass: 0.1,
    position,
    args: size,
  }));

  React.useEffect(() => {
    const randomImpulse = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 2,
      (Math.random() - 0.5) * 2
    );
    api.applyImpulse(randomImpulse.toArray(), [0, 0, 0]);
  }, [api]);

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} side={DoubleSide} />
    </mesh>
  );
};

const VerticalSurface: React.FC<VerticalSurfaceProps> = ({
  width = 5,
  height = 5,
  color = '#fff',
  children,
  position = [0, 0, 0],
  rotation = [0, Math.PI / 2, 0],
  colliderThickness = 0.1,
  breakThreshold = 2,
  headRef = null,
  onExplode,
}) => {
  const [exploded, setExploded] = useState(false);

  // Create a physics collider for the intact wall.
  const [ref, api] = useBox(() => ({
    type: 'Kinematic',
    mass: 10,
    position,
    rotation,
    args: [width, height, 0.5],
    userData: { type: "vertical" },
    linearFactor: [1, 0, 1],
    onCollide: (e: any) => {
      // Only trigger explosion if the colliding object is the wrecking ball.
      if (e.body.userData?.type !== "wreckingBall") {
        api.velocity.set(0, 0, 0);
        return;
      }
      if (!exploded && e.contact && e.contact.impactVelocity > breakThreshold) {
        setExploded(true);
        if (onExplode) onExplode();
      }
    },
  }));

  if (exploded) {
    const numCols = 6;
    const numRows = 12;
    const fragmentWidth = width / numCols;
    const fragmentHeight = height / numRows;
    const fragments = [];
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const xOffset = -width / 2 + fragmentWidth / 2 + col * fragmentWidth;
        const yOffset = height / 2 - fragmentHeight / 2 - row * fragmentHeight;
        fragments.push(
          <FragmentPiece
            key={`${row}-${col}`}
            position={[position[0] + xOffset, position[1] + yOffset, position[2]]}
            size={[fragmentWidth, fragmentHeight, colliderThickness]}
            color={color}
          />
        );
      }
    }
    return (
      <>
        {fragments}
      </>
    );
  }

  return (
    <group ref={ref}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.5]} />
        <meshStandardMaterial color={color} side={DoubleSide} />
      </mesh>
      <Html
        occlude="blending" 
        prepend
        transform
        position={[0, 1, 0]}
        distanceFactor={14}
        rotation={[0, Math.PI, 0]}
      >
        <div className='vertical-surface-container'>{children}</div>
      </Html>
    </group>
  );
};
export default VerticalSurface;
