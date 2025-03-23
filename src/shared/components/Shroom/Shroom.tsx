import React, { useRef, useState, useEffect } from "react";
import { useAnimations } from "@react-three/drei";
import { useBox } from "@react-three/cannon";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface ShroomProps {
  id: number;
  active: boolean; // Whether this shroom is active (visible and moving)
  position: [number, number, number]; // Position when activated
  model: THREE.Group; // Preloaded model to share among shrooms
  onCollected: (id: number) => void;
}

const Shroom: React.FC<ShroomProps> = ({ id, active, position, model, onCollected }) => {
  const [collected, setCollected] = useState(false);
  const [localPos, setLocalPos] = useState(new THREE.Vector3(...position));
  const [opacity, setOpacity] = useState(active ? 1 : 0);
  const ref = useRef<THREE.Group>(null);
  const { actions } = useAnimations(model.animations, model);

  // Create a kinematic physics body.
  const [physicsRef, api] = useBox(() => ({
    type: "Kinematic",
    args: [0.5, 0.5, 0.5],
    position: active ? position : [0, -1000, 0], // Offscreen when inactive.
    rotation: [-Math.PI / 2, 0, 0],
    userData: { type: "shroom" },
    onCollide: (e) => {
      if (e.body.userData?.type === "head") {
        setCollected(true);
        onCollected(id);
        // Optionally start a fade-out animation by setting opacity to 0.
      }
    },
  }));

  // When active, initialize position and opacity.
  useEffect(() => {
    if (active) {
      setLocalPos(new THREE.Vector3(...position));
      setOpacity(1);
      api.position.set(...position);
    } else {
      // When inactive, move it offscreen and set opacity to 0.
      setOpacity(0);
      api.position.set(0, -1000, 0);
    }
  }, [active, position, api]);

  // Update the shared model's material opacity.
  useEffect(() => {
    if (ref.current) {
      ref.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material;
          child.castShadow = true;
          child.receiveShadow = true;
          if (Array.isArray(mat)) {
            mat.forEach(m => {
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

  // Play animation and control movement when active.
  useFrame(() => {
    if (!active || collected || !physicsRef.current) return;
    // Simulate gravity by subtracting from the y coordinate.
    // Adjust 0.005 to match a gravity-like acceleration.
    localPos.y -= 0.03;
    // Prevent falling below the ground (assume ground at y = -1.8)
    if (localPos.y < -1) {
      localPos.y = -1;
    }
    // Horizontal movement remains manual.
    localPos.x += 0.03;
    api.position.set(localPos.x, localPos.y, localPos.z);
  });
  // Render the shroom using the shared model.
  return (
    <group ref={physicsRef} scale={[0.01, 0.01, 0.01]}>
      <primitive ref={ref} object={model.clone()} castShadow receiveShadow />
    </group>
  );
};

export default Shroom;
