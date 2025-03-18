import React, { forwardRef, useMemo, useRef } from "react";
import { useBox } from "@react-three/cannon";
import { Html, Text, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export interface SocialButtonProps {
  social: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

const SocialButton = forwardRef<THREE.Group, SocialButtonProps>(
  ({ social, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] }, ref) => {
    // Create a static physics body for the social button.
    const [bodyRef] = useBox(() => ({
      mass: 0,
      position,
      args: [2, 0.5, 2], // Adjust collider size if needed.
    }));

    // Load the same button model from a GLB file.
    const { scene } = useGLTF("/models/button.glb");
    // Clone the scene for each instance so they don't conflict.
    const clonedScene = useMemo(() => {
      const clone = scene.clone(true);
      clone.position.set(0, 0, 0);
      return clone;
    }, [scene]);

    // Expose the physics body ref to the parent.
    React.useImperativeHandle(ref, () => bodyRef.current as THREE.Group);

    return (
      <group ref={ref} position={position} rotation={rotation} scale={scale}>
        <primitive object={clonedScene} />
        <Text
          rotation={[Math.PI / 2, Math.PI, 0]} // Adjust based on your model's orientation.
          position={[0, 0.3, 0]}              // Adjust so text appears on top of the model.
          fontSize={0.1}
          color="black"
          anchorX="center"
          anchorY="middle"
          fontWeight={800}
        >
          {social}
        </Text>
      </group>
    );
  }
);

SocialButton.displayName = "SocialButton";

export default SocialButton;
