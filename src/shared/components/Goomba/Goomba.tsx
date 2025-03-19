import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useBox } from "@react-three/cannon";
import { useAnimations, useFBX } from "@react-three/drei";
import * as THREE from "three";

interface GoombaProps {
  position?: [number, number, number];
  headRef: React.MutableRefObject<THREE.Object3D | null>;
}

const Goomba: React.FC<GoombaProps> = ({ position = [0, -1.8, 0], headRef }) => {
  // Load the FBX model once.
  const originalFBX = useFBX("/models/mario-mini/Goomba.fbx") as THREE.Group;
  // Clone it for this particular Goomba instance.
  const fbx = useMemo(() => originalFBX.clone(), [originalFBX]);

  // Use animations on the cloned model.
  const groupRef = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(fbx.animations, groupRef);

  useEffect(() => {
    if (actions && actions["Take 001"]) {
      actions["Take 001"].reset().setLoop(THREE.LoopRepeat, Infinity).play();
    }
  }, [actions, names]);

  // Create a dynamic or kinematic physics body for collision detection.
  const [boxRef, api] = useBox(() => ({
    type: "Dynamic", // or "Kinematic" if you prefer
    args: [1, 1, 1],
    position,
    userData: { type: "goomba" },
  }));

  // Attach the box to the group so the model follows physics.
  useEffect(() => {
    if (boxRef.current && groupRef.current && !groupRef.current.children.includes(boxRef.current)) {
      groupRef.current.add(boxRef.current);
    }
  }, [boxRef, groupRef]);

  // Patrol / chase logic
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const patrolSpeed = 0.01;
  const chaseSpeed = 0.02;
  const patrolRange = 3;
  const detectionDistance = 5;
  const initialPos = useRef(new THREE.Vector3(...position));

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const goombaPos = groupRef.current.position;

    // Check distance to head
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

    const speed = chasing ? chaseSpeed : patrolSpeed;

    // Patrol if not chasing
    if (!chasing) {
      const offset = goombaPos.x - initialPos.current.x;
      if (offset > patrolRange) setDirection(-1);
      else if (offset < -patrolRange) setDirection(1);
    }

    // Move horizontally
    goombaPos.x += direction * speed;
    api.position.set(goombaPos.x, goombaPos.y, goombaPos.z);

    // Rotate to face left/right
    const targetRotY = direction === 1 ? Math.PI / 2 : -Math.PI / 2;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.1
    );

    // Adjust animation speed
    const timeScale = speed / patrolSpeed;
    if (actions && actions["Take 001"]) {
      actions["Take 001"].timeScale = timeScale + 0.7;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={[0.02, 0.02, 0.02]}
      castShadow
      receiveShadow
      rotation={[0, 0, 0]}
    >
      {/* Use the cloned FBX as the primitive */}
      <primitive object={fbx} />
    </group>
  );
};

export default Goomba;
