import React, { useRef, useEffect, useState } from 'react';
import { Html,  } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from 'react-three-fiber';
import './InteractiveHtmlButton.scss';
export interface InteractiveHtmlButtonProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  text: string;
  
  headRef: React.RefObject<THREE.Group | null>;
  threshold?: number; // Distance threshold (in world units) for the button to appear
  onClick?: () => void;
}

const InteractiveHtmlButton: React.FC<InteractiveHtmlButtonProps> = ({
    position,
  rotation = [0, 0, 0],
  color = 'blue',
  text,
  headRef,
  threshold = 3,
  onClick,
}) => {
  const [visible, setVisible] = useState(false);
  // Convert the provided location array into a THREE.Vector3.
  const buttonPos = new THREE.Vector3(...position);

  useFrame(() => {
    if (headRef && headRef.current) {
      const headPos = new THREE.Vector3();
      headRef.current.getWorldPosition(headPos);
      const distance = headPos.distanceTo(buttonPos);
      // Set visibility if head is within threshold distance.
      setVisible(distance < threshold);
    }
  });

  return (
    <Html
      transform
      position={position}
      rotation={rotation}
      center
      style={{
        pointerEvents: 'auto',
        transition: 'opacity 0.5s ease, transform 0.3s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.5)',
      }}
    >
      <div
        className="interactive-button"
        style={{
          background: color,
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
      >
        {text}
      </div>
    </Html>
  );
};

export default InteractiveHtmlButton;
