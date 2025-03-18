import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useBox } from "@react-three/cannon";
import { useAnimations,useFBX } from "@react-three/drei";
import * as THREE from "three";

interface GoombaProps {
  position?: [number, number, number];
  headRef: React.MutableRefObject<THREE.Object3D | null>;
}

const Goomba: React.FC<GoombaProps> = ({ position = [0, -1.8, 0], headRef }) => {
  // Load the FBX model.
  const fbx = useFBX("/models/mario-mini/Goomba.fbx") as THREE.Group;
  // Create a container group for our model.
  const groupRef = useRef<THREE.Group>(null);
  
  // Use animations hook.
  const { actions, names } = useAnimations(fbx.animations, groupRef);
  
  useEffect(() => {
    if (actions && actions["Take 001"]) {
      actions["Take 001"]
        .reset()
        .setLoop(THREE.LoopRepeat, Infinity)
        .play();
    }
  }, [actions, names]);
  
  // Create a kinematic physics body for collision detection.
  const [boxRef, api] = useBox(() => ({
    type: "Dynamic",
    args: [1, 1, 1], // adjust as necessary for your model
    position,
    userData: { type: "goomba" },
  }));
  
  // Instead of replacing the group ref with the physics ref,
  // add the physics body as a child of our container group.
  useEffect(() => {
    if (boxRef.current && groupRef.current && !groupRef.current.children.includes(boxRef.current)) {
      groupRef.current.add(boxRef.current);
    }
  }, [boxRef, groupRef]);
  
  // Patrol and chase parameters.
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const patrolSpeed = 0.01;
  const chaseSpeed = 0.02;
  const patrolRange = 3;       // Distance from starting position.
  const detectionDistance = 5; // If head is within 5 units, start chasing.
  const initialPos = useRef(new THREE.Vector3(...position));
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const goombaPos = groupRef.current.position;
    // Check distance to head.
    let chasing = false;
    if (headRef.current) {
      const headPos = new THREE.Vector3();
      headRef.current.getWorldPosition(headPos);
      const dist = goombaPos.distanceTo(headPos);
      if (dist < detectionDistance) {
        chasing = true;
        setDirection(headPos.x - goombaPos.x > 0 ? 1 : -1);
      }
    }
  
    // Choose speed.
    const speed = chasing ? chaseSpeed : patrolSpeed;
  
    // Patrol within a range if not chasing.
    if (!chasing) {
      const offset = goombaPos.x - initialPos.current.x;
      if (offset > patrolRange) setDirection(-1);
      else if (offset < -patrolRange) setDirection(1);
    }
  
    // Update horizontal position.
    goombaPos.x += direction * speed;
    api.position.set(goombaPos.x, goombaPos.y, goombaPos.z);
  
    // Set target rotation for a profile view:
    // For example, if facing right, use +90° (π/2) and if left, use -90° (-π/2)
    const targetRotY = direction === 1 ? Math.PI / 2 : -Math.PI / 2;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.1);
  
    // Adjust the animation time scale based on speed.
    const timeScale = speed / patrolSpeed; // This will be 1 during patrol and higher when chasing.
    if (actions && actions["Take 001"]) {
      actions["Take 001"].timeScale = timeScale + 0.7 ;
    }
  });
  
  return (
    <group ref={groupRef} position={position} scale={[0.02, 0.02, 0.02]} castShadow receiveShadow rotation={[0, 0, 0]}>
      <primitive object={fbx} />
    </group>
  );
};

export default Goomba;
