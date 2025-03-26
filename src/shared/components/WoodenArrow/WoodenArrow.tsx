import React, { forwardRef, useMemo } from "react";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useBox } from "@react-three/cannon";

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
    const { scene } = useGLTF(`${process.env.PUBLIC_URL}/models/wooden_arrow.glb`);
    // Clone the scene for each instance using useMemo for performance.
    const clonedScene = useMemo(() => scene.clone(true), [scene]);

    // Enable shadows on the clone.
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    const [physicsRef] = useBox(() => ({
      type: "Static",
      position,
      rotation,
      args: [3,5,0.3],
    }));
    function mergeRefs<T>(...refs: React.Ref<T>[]): React.RefCallback<T> {
      return (node: T) => {
        refs.forEach(ref => {
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<T>).current = node;
          }
        });
      };
    }
    
    return (
      <group  ref={mergeRefs(physicsRef, ref)} position={position} rotation={rotation} scale={scale}>
        <primitive object={clonedScene} />
        <Html transform center position={[2, 0.2, 0]} rotation={[0,flipText ? -Math.PI : 0 ,0]} zIndexRange={[0]}>
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
