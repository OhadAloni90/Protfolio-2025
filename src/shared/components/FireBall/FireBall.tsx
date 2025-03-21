// Fireball.tsx
import React, { useEffect } from "react";
import { useBox, useSphere } from "@react-three/cannon";
import * as THREE from "three";

interface FireballProps {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  onRemove: (id: number) => void;
}

const Fireball: React.FC<FireballProps> = ({ id, position, velocity, onRemove }) => {
  const [ref, api] = useSphere(() => ({
    mass: 0.02,
    position,
    velocity,
    args: [1],
    restitution: 0.9, // How bouncy the fireball is.
    linearDamping: 0.2, // Lower damping to prevent it from stopping too quickly.
    userData: { type: "fireball", id },
    onCollide: (e) => {
      const collidedType = e.body.userData?.type?.toLowerCase();
      if (collidedType === "goomba") {
        onRemove(id);
      } 
    },
  }));

  // Remove the fireball after 3 seconds (as a fallback).
  useEffect(() => {
    const timeout = setTimeout(() => {
      onRemove(id);
    }, 1500); // 3000 ms = 3 seconds
    return () => clearTimeout(timeout);
  }, [id, onRemove]);

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="orange" emissive="red" />
    </mesh>
  );
};

export default Fireball;
