import React, { forwardRef, useMemo } from "react";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface WoodenArrowProps {
  text: string;
  flipText: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

const WoodenArrow = forwardRef<THREE.Group, WoodenArrowProps>(
  ({ text, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1],flipText }, ref,) => {
    // Load the wooden arrow GLB (shared across instances)
    const { scene } = useGLTF("/models/wooden_arrow.glb");
    // Clone the scene for each instance using useMemo for performance.
    const clonedScene = useMemo(() => scene.clone(true), [scene]);

    // Enable shadows on the clone.
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return (
      <group ref={ref} position={position} rotation={rotation} scale={scale}>
        <primitive object={clonedScene} />
        <Html transform center position={[1.4, 0.2, 0]} rotation={[0,flipText ? -Math.PI : 0 ,0]}>
          <div
          className="text text_bold text_med"
            style={{
              backgroundColor: "rgba(255,255,255,0.8)",
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
            }}
          >
            {text}
          </div>
        </Html>
      </group>
    );
  }
);

WoodenArrow.displayName = "WoodenArrow";

export default WoodenArrow;
