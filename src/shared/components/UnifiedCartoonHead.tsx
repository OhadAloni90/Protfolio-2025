import React, { forwardRef, useRef, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useBox } from "@react-three/cannon";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export interface UnifiedCartoonHeadProps {
  shorten: boolean;
  onHoverChange: (hovering: boolean) => void;
  targetPosition: THREE.Vector3 | null;
  onCollide?: (e: any) => void;
  position?: [number, number, number];
}

const UnifiedCartoonHead = forwardRef<THREE.Group, UnifiedCartoonHeadProps>(
  (
    { shorten, onHoverChange, targetPosition, onCollide, position = [0, -0.5, 0] },
    ref
  ) => {
    // Create a dynamic physics body for the head
    const [bodyRef, api] = useBox(() => ({
      type: "Dynamic",
      args: [2, 2, 1],
      position,
      collisionFilterGroup: 3,
      collisionFilterMask: 3,
      onCollide,
      userData: { type: "head" },
    }));

    const groupRef = useRef<THREE.Group>(null);
    const gltf = useLoader(GLTFLoader, "/models/Head3.glb");

    // Re-center the model if needed and enable shadows
    useEffect(() => {
      if (!gltf?.scene) return;
      const box3 = new THREE.Box3().setFromObject(gltf.scene);
      const center = box3.getCenter(new THREE.Vector3());
      // gltf.scene.position.sub(center); // commented out if not needed
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }, [gltf]);

    // Refs and constants for the jump (parabolic arc)
    const startPos = useRef<THREE.Vector3 | null>(null);
    const endPos = useRef<THREE.Vector3 | null>(null);
    const progress = useRef(0);
    const travelDuration = 1.5; // seconds for the jump
    const easeOutQuad = (t: number) => t * (2 - t);

    // Whenever a target position is provided, initialize the jump
    useEffect(() => {
      if (groupRef.current && targetPosition) {
        startPos.current = groupRef.current.position.clone();
        endPos.current = targetPosition.clone();
        progress.current = 0;
      }
    }, [targetPosition]);

    useFrame((state, delta) => {
      if (!groupRef.current) return;

      // If jump is in progress, move toward the target using a parabolic arc.
      if (startPos.current && endPos.current) {
        progress.current = Math.min(progress.current + delta / travelDuration, 1);
        const tEased = easeOutQuad(progress.current);

        // Interpolate X/Z positions
        const newX = THREE.MathUtils.lerp(startPos.current.x, endPos.current.x, tEased);
        const newZ = THREE.MathUtils.lerp(startPos.current.z, endPos.current.z, tEased);
        // Calculate Y with parabolic offset
        const baseY = THREE.MathUtils.lerp(startPos.current.y, endPos.current.y, tEased);
        const totalDist = startPos.current.distanceTo(endPos.current);
        const amplitude = totalDist * 0.15;
        const yOffset = 10 * amplitude * tEased * (1 - tEased);
        const newPosition = new THREE.Vector3(newX, baseY + yOffset, newZ);

        // Update the group and the physics body
        groupRef.current.position.copy(newPosition);
        api.position.set(newPosition.x, newPosition.y, newPosition.z);

        // Rotate the head toward the travel direction
        const deltaX = endPos.current.x - newX;
        const deltaZ = endPos.current.z - newZ;
        const angle = Math.atan2(deltaX, deltaZ);
        groupRef.current.rotation.set(0, angle, 0);

        // If jump is complete, reset jump variables.
        if (progress.current >= 1) {
          groupRef.current.position.copy(endPos.current);
          api.position.set(endPos.current.x, endPos.current.y, endPos.current.z);
          startPos.current = null;
          endPos.current = null;
          progress.current = 0;
        }
      } else {
        // Normal drift behavior: use the current position as base.
        const offsetFactor = 1;
        const mouseOffsetX = state.mouse.x * offsetFactor;
        const mouseOffsetY = state.mouse.y * offsetFactor;
        // Instead of using a fixed initial position, use the current position.
        const currentBase = groupRef.current.position.clone();
        const targetPos = currentBase.add(new THREE.Vector3(mouseOffsetX, mouseOffsetY, 0));

        // Smoothly interpolate the head's position toward the target position.
        groupRef.current.position.lerp(targetPos, delta * 2);
        const { x, y, z } = groupRef.current.position;
        api.position.set(x, y, z);

        // Update rotation to follow the mouse.
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          state.mouse.x * 0.5,
          delta * 8
        );
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          -state.mouse.y * 0.5,
          delta * 8
        );
      }
    });

    // Expose the groupRef so parents can access it.
    React.useImperativeHandle(ref, () => groupRef.current as THREE.Group);

    return (
      <group ref={groupRef}>
        <mesh
          ref={bodyRef}
          onPointerOver={() => onHoverChange(true)}
          onPointerOut={() => onHoverChange(false)}
        >
          <primitive object={gltf.scene} />
        </mesh>
      </group>
    );
  }
);

UnifiedCartoonHead.displayName = "UnifiedCartoonHead";
export default UnifiedCartoonHead;
