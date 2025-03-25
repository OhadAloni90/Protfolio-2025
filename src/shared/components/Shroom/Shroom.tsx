import React, { useRef, useState, useEffect } from "react";
import { useBox } from "@react-three/cannon";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface ShroomProps {
  id: number;
  active: boolean;
  position: [number, number, number];
  model: THREE.Group;
  onCollected: (id: number) => void;
}

const Shroom: React.FC<ShroomProps> = ({ id, active, position, model, onCollected }) => {
  const [collected, setCollected] = useState(false);
  const [localPos, setLocalPos] = useState(new THREE.Vector3(...position));
  const [opacity, setOpacity] = useState(active ? 1 : 0);
  const ref = useRef<THREE.Group>(null);
  const collectedRef = useRef(false); // ✅ NEW guard to prevent multiple collections

  const [physicsRef, api] = useBox(() => ({
    type: "Kinematic",
    args: [0.5, 0.5, 0.5],
    position: active ? position : [0, -1000, 0],
    rotation: [-Math.PI / 2, 0, 0],
    userData: { type: "shroom" },
    onCollide: (e) => {
      if (collectedRef.current) return; // ✅ Guard: already collected
      if (e.body.userData?.type === "head") {
        collectedRef.current = true; // ✅ Lock it *before* calling onCollected
        onCollected(id);
      }
    },
  }));
  

  useEffect(() => {
    if (active) {
      collectedRef.current = false; // ✅ Reset on reuse
      setLocalPos(new THREE.Vector3(...position));
      setOpacity(1);
      api.position.set(...position);
    } else {
      setOpacity(0);
      api.position.set(0, -1000, 0);
    }
  }, [active, position, api]);
  

  useEffect(() => {
    if (ref.current) {
      ref.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material;
          child.castShadow = true;
          child.receiveShadow = true;
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

  useFrame(() => {
    if (!active || collected || !physicsRef.current) return;
    localPos.y -= 0.03;
    if (localPos.y < -1) {
      localPos.y = -1;
    }
    localPos.x += 0.03;
    api.position.set(localPos.x, localPos.y, localPos.z);
  });

  return (
    <group ref={physicsRef} scale={[0.01, 0.01, 0.01]}>
      <primitive ref={ref} object={model.clone()} castShadow receiveShadow />
    </group>
  );
};

export default Shroom;
