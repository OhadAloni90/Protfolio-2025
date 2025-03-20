import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useBox } from "@react-three/cannon";
import { useAnimations, useFBX } from "@react-three/drei";
import * as THREE from "three";

interface GoombaProps {
  position?: [number, number, number];
  headRef: React.MutableRefObject<THREE.Object3D | null>;
  onHit?: () => void; // Called when Goomba hits Mario from the side.
  onStomp?: () => void; // Called when Mario stomps on Goomba.
}

const Goomba: React.FC<GoombaProps> = ({ position = [0, -1.8, 0], headRef, onHit, onStomp }) => {
  // Load the Goomba FBX model once.
  const originalFBX = useFBX(`${process.env.PUBLIC_URL}/models/mario-mini/Goomba.fbx`) as THREE.Group;
  // Clone the model for this instance
  const fbx = useMemo(() => originalFBX.clone(), [originalFBX]);
  // Use animations on the cloned model.
  const groupRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(fbx.animations, groupRef);
  useEffect(() => {
    if (actions && actions["Take 001"]) {
      actions["Take 001"].reset().setLoop(THREE.LoopRepeat, Infinity).play();
    }
  }, [actions]);
  // Track whether the Goomba is “dead” (stomped).
  const [isDead, setIsDead] = useState(false);
  // We'll store a reference to the time we got stomped, so we can animate.
  const deadTimeRef = useRef<number | null>(null);
  // Create a physics body for collision detection.
  const [boxRef, api] = useBox(() => ({
    type: "Dynamic",
    args: [1, 1.5, 1],
    mass: 2,
    position: [position[0], position[1] + 1, position[2]],
    userData: { type: "goomba" },
    onCollide: (e) => {
      if (isDead) return; // If already dead, ignore further collisions.
      if (e.body.userData?.type === "head") {
        // e.contact.ni is the collision normal relative to the Goomba
        if (e.contact && typeof e.contact.ni[1] === "number") {
          // If normal's y is less than -0.5 => head from above
          if (e.contact.ni[1] < -0.5) {
            // Stomped
            setIsDead(true);
            deadTimeRef.current = performance.now();
            // Disable collisions so we won't interact further
            api.collisionFilterMask.set(0);
            if (onStomp) onStomp();
          } else {
            // Otherwise, side collision => Mario takes damage
            if (onHit) onHit();
          }
        }
      }  else if(e.body.userData?.type === 'marioBrick') {
        const normalX = e.contact?.ni[0] ?? 0;
        // Only react to significant side‑impact
        if (Math.abs(normalX) > 0.5) {
          setDirection(normalX > 0 ? 1 : -1);
        }
      }
    },
  }));

  // Attach the physics box to the model's group.
  useEffect(() => {
    if (boxRef.current && groupRef.current && !groupRef.current.children.includes(boxRef.current)) {
      groupRef.current.add(boxRef.current);
    }
  }, [boxRef, groupRef]);
  // Patrol & chase logic
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const patrolSpeed = 0.01;
  const chaseSpeed = 0.02;
  const patrolRange = 3;
  const detectionDistance = 5;
  const initialPos = useRef(new THREE.Vector3(...position));

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const goombaPos = groupRef.current.position;
    if (!isDead) {
      // Normal movement if not dead
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
      if (!chasing) {
        const offset = goombaPos.x - initialPos.current.x;
        if (offset > patrolRange) setDirection(-1);
        else if (offset < -patrolRange) setDirection(1);
      }
      // Move horizontally
      goombaPos.x += direction * speed;
      api.position.set(goombaPos.x, goombaPos.y, goombaPos.z);
      // Face left/right
      const targetRotY = direction === 1 ? Math.PI / 2 : -Math.PI / 2;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.1);
      // Adjust animation speed
      if (actions && actions["Take 001"]) {
        const timeScale = speed / patrolSpeed;
        actions["Take 001"].timeScale = timeScale + 0.7;
      }
    } 
  });

  // Animate the “squash” effect after stomping
  useFrame(() => {
    if (isDead && groupRef.current && deadTimeRef.current !== null) {
      const elapsed = performance.now() - deadTimeRef.current;
      // Let's do a simple scale-down over 300 ms
      const duration = 400; // ms
      if (elapsed < duration) {
        // fraction of animation progress
        const t = elapsed / duration;
        // from scale=1 to scale=0.2 in Y
        const newScaleY = THREE.MathUtils.lerp(0.01, 0.02, t);
        // keep X and Z at 1 or you can also shrink them a bit
        groupRef.current.scale.set(0.02, newScaleY, 0.02);
      } else {
        // After 400 ms, we remove the Goomba from the scene
        groupRef.current.visible = false;
        // ...and disable further collisions by:
        // (1) Zero out its velocity
        api.velocity.set(0, 0, 0);
        // (2) Move it far away from the scene (so Debug no longer shows it)
        api.position.set(10000, 10000, 10000);
      }
    }
  });

  // If invisible or we want to fully remove it, we can skip rendering
  // but if we do return null, we can't animate. So we might just hide it.
  // if (isDead) return null;

  return (
    <group ref={groupRef} position={position} scale={[0.02, 0.02, 0.02]} castShadow receiveShadow>
      <primitive object={fbx} />
    </group>
  );
};

export default Goomba;
