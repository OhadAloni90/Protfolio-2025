import React, { forwardRef, useMemo } from "react";
import { useBox } from "@react-three/cannon";
import { Html, Text, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

export interface PhysicsPushButtonProps {
  text?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  dialogOpen?: boolean;
  onCloseDialog?: () => void;
  dialogContent?: React.ReactNode;
}

const PhysicsPushButton = forwardRef<THREE.Group, PhysicsPushButtonProps>(
  (
    {
      text = "PUSH",
      position = [0, 0, 0],
      rotation = [0, 0, 0],
      scale = [1, 1, 1],
      dialogOpen = false,
      onCloseDialog,
      dialogContent,
    },
    ref
  ) => {
    // Create a static physics body for the button with a custom tag.
    const [bodyRef] = useBox(() => ({
      mass: 0,
      position,
      args: [2, 0.5, 2],
      userData: { type: "button" },
    }));

    // Load and clone your button model.
    const { scene, animations } = useGLTF(`${process.env.PUBLIC_URL}/models/button.glb`);
    const clonedScene = useMemo(() => {
      const clone = scene.clone(true);
      clone.position.set(0, 0, 0);
      return clone;
    }, [scene]);

    React.useImperativeHandle(ref, () => bodyRef.current as THREE.Group);

    return (
      <group ref={ref} position={position} rotation={rotation} scale={scale}>
        <primitive
          object={clonedScene}
          onPointerDown={(e: Event) => e.stopPropagation()}
          onPointerUp={(e: Event) => e.stopPropagation()}
        />
        <Text
          castShadow
          rotation={[Math.PI / 2, Math.PI, 0]}
          position={[0, 0.3, 0]}
          fontSize={0.1}
          color="black"
          anchorX="center"
          anchorY="middle"
          fontWeight={800}
        >
          {text}
        </Text>
      </group>
    );
  }
);

PhysicsPushButton.displayName = "PhysicsPushButton";

export default PhysicsPushButton;
