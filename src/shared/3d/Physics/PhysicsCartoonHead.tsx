import React, { forwardRef, useRef, useEffect, useLayoutEffect, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useBox } from "@react-three/cannon";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export interface PhysicsCartoonHeadProps {
  shorten: boolean;
  onHoverChange: (hovering: boolean) => void;
  targetPosition: THREE.Vector3 | null; // if provided, head travels in a parabolic arc to this position
  onCollide?: (e: any) => void; // physics collision callback
  position?: [number, number, number]; // initial position
  disableDrift?: boolean
}

const PhysicsCartoonHead = forwardRef<THREE.Group, PhysicsCartoonHeadProps>(
  ({ shorten, onHoverChange, targetPosition, onCollide, position = [0, 0, 0] ,      disableDrift
  }, ref) => {
    // Create a dynamic physics body for the head
    const [bodyRef, api] = useBox(() => ({
      type: "Dynamic",
      args: [1, 2, 1],
      position,
      collisionFilterGroup: 3,
      collisionFilterMask: 3,
      onCollide: (e) => {
        if (e.body.userData?.type === "marioBrick") {
          if (e.contact && typeof e.contact.ni[1] === "number") {
            // When the head lands on top, the contact normal's y should be high.
            if (e.contact.ni[1] > 0.5) {
              const brickTop = e.body.position.y + 0.5;
              // Defer state updates so they occur after the current render.
              setTimeout(() => {
                setIsOnBrick(true);
                api.velocity.set(0, 0, 0);
              }, 0);
            }
          }
        }
        // Also, you can call any additional onCollide passed in.
        onCollide && onCollide(e);
      },
      userData: { type: "head" },
    }));
    const [isOnBrick, setIsOnBrick] = useState(false);
    const [brickTop, setBrickTop] = useState<number | null>(null);

    // We'll use a group for the visual head
    const groupRef = useRef<THREE.Group>(null);
    const gltf = useLoader(GLTFLoader, "/models/Head3.glb");

    // Enable shadows on the loaded model
    useEffect(() => {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }, [gltf]);
    useEffect(() => {
      if (targetPosition) {
        setIsOnBrick(false);
        setBrickTop(null);
      }
    }, [targetPosition]);

    useLayoutEffect(() => {
      if (groupRef.current) {
        const pos = groupRef.current.position;
        api.position.set(pos.x, pos.y, pos.z);
      }
    }, []);

    // --- Parabolic (jump) movement state ---
    const startPosition = useRef<THREE.Vector3 | null>(null);
    const endPosition = useRef<THREE.Vector3 | null>(null);
    const travelProgress = useRef(0);
    const travelDuration = 1; // Adjust duration of the jump here

    // When a new targetPosition comes in, start the jump.
    useEffect(() => {
      if (groupRef.current && targetPosition) {
        // (Optional: reject jump if target is too far, e.g. z >= 20)
        if (targetPosition.z >= 20) return;
        startPosition.current = groupRef.current.position.clone();
        endPosition.current = targetPosition.clone();
        travelProgress.current = 0;
      }
    }, [targetPosition]);

    useFrame((state, delta) => {
      if (!groupRef.current) return;
    
      if (startPosition.current && endPosition.current) {
        // --- Jump movement (parabolic arc) ---
        travelProgress.current = Math.min(travelProgress.current + delta / travelDuration, 1);
        const t = travelProgress.current;
    
        // Lerp X and Z from start to end
        const newX = THREE.MathUtils.lerp(startPosition.current.x, endPosition.current.x, t);
        const newZ = THREE.MathUtils.lerp(startPosition.current.z, endPosition.current.z, t);
        // Lerp Y then add a parabolic offset (bounce)
        const baseY = THREE.MathUtils.lerp(startPosition.current.y, endPosition.current.y, t);
        const totalDist = startPosition.current.distanceTo(endPosition.current);
        const amplitude = totalDist * 0.2; // adjust bounce amplitude as needed
        const yOffset = 10 * amplitude * t * (1 - t);
        groupRef.current.position.set(newX, baseY + yOffset, newZ);
    
        // Compute the natural angle from start to end
        const deltaX = endPosition.current.x - newX;
        const deltaZ = endPosition.current.z - newZ;
        let angle = Math.atan2(deltaX, deltaZ);
        // If disableDrift (Mario mode), override angle with fixed profile orientation.
        if (disableDrift) {
          angle = -Math.PI / 2; // adjust as needed (e.g., Math.PI/2 for the opposite profile)
        }
        groupRef.current.rotation.set(0, angle, 0);
    
        // End jump when finished
        if (travelProgress.current >= 1) {
          startPosition.current = null;
          endPosition.current = null;
          travelProgress.current = 0;
        }
      } else if (!disableDrift) {
        // --- Continuous "walking" / drift movement (like in CartoonHead) ---
        const driftFactor = 0.1; // tweak this factor for sensitivity
        const mouseOffset = new THREE.Vector3(state.mouse.x, state.mouse.y, 0);
        // Compute a target position offset from the current one
        const currentPos = groupRef.current.position.clone();
        const driftTarget = currentPos.add(mouseOffset.multiplyScalar(driftFactor));
        // Lerp toward the drift target so the head moves gradually
        groupRef.current.position.lerp(driftTarget, delta * 2);
        // Rotate the head based on mouse input
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          state.mouse.x * 0.5,
          delta * 2
        );
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          -state.mouse.y * 0.5,
          delta * 2
        );
      } else {
        // If disableDrift is true and we're not jumping, force a fixed profile rotation.
        groupRef.current.rotation.y = -Math.PI / 2;
      }
    
      // Always sync the physics body to the group's position
      const pos = groupRef.current.position;
      api.position.set(pos.x, pos.y, pos.z);
    });
    
    // Expose the group's ref to parent components
    React.useImperativeHandle(ref, () => groupRef.current as THREE.Group);
    return (
      <group ref={groupRef} position={position} onPointerOver={() => onHoverChange(true)} onPointerOut={() => onHoverChange(false)}>
        <primitive object={gltf.scene} />
      </group>
    );
    
  }
);

PhysicsCartoonHead.displayName = "PhysicsCartoonHead";
export default PhysicsCartoonHead;
