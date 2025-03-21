import React, { useRef, useState, useEffect } from "react";
import { useBox } from "@react-three/cannon";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

interface FireFlowerProps {
  id: number;
  active: boolean; // Whether the fire flower is active (visible)
  position: [number, number, number]; // Position when spawned (e.g. top edge of the brick)
  model: THREE.Group; // Preloaded fire flower model to share among instances
  onCollected: (id: number) => void;
}

const FireFlower: React.FC<FireFlowerProps> = ({ id, active, position, model, onCollected }) => {
  const [collected, setCollected] = useState(false);
  const [opacity, setOpacity] = useState(active ? 1 : 0);
  const groupRef = useRef<THREE.Group>(null);

  // Create a static physics body so that the flower doesn't move.
  const [physicsRef, api] = useBox(() => ({
    type: "Static",
    args: [0.5, 0.5, 0.5], // adjust as needed to fit your model scale
    position: active ? position : [0, -1000, 0], // Offscreen when inactive
    rotation: [0, 0, 0],
    userData: { type: "fireFlower" },
    onCollide: (e) => {
      if (e.body.userData?.type === "head" && !collected) {
        setCollected(true);
        onCollected(id);
      }
    },
  }));

  // When active, ensure the position and opacity are set correctly.
  useEffect(() => {
    if (active) {
      setOpacity(1);
      api.position.set(...position);
    } else {
      setOpacity(0);
      api.position.set(0, -1000, 0);
    }
  }, [active, position, api]);

  // Update the model's material opacity.
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mat = (child as THREE.Mesh).material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => {
              m.transparent = true;
              m.opacity = opacity;
            });
          } else {
            mat.transparent = true;
            mat.opacity = opacity;
          }
        }
      });
    }
  }, [opacity]);

  return (
    <group ref={physicsRef} scale={[0.003, 0.003, 0.003]}>
      <primitive ref={groupRef} object={model.clone()} castShadow receiveShadow />
    </group>
  );
};

export default FireFlower;
