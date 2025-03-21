import React, { forwardRef, useRef, useState, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

export interface CartoonHeadProps {
  shorten: boolean;
  onHoverChange: (hovering: boolean) => void;
  targetPosition: THREE.Vector3 | null; // When provided, head travels to this target
}

const CartoonHead = forwardRef<THREE.Group, CartoonHeadProps>(
  ({ shorten, onHoverChange, targetPosition }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const [currentModel, setCurrentModel] = useState<THREE.Group | null>(null);
    const [startPosition, setStartPosition] = useState<THREE.Vector3 | null>(null);
    const [endPosition, setEndPosition] = useState<THREE.Vector3 | null>(null);
    const [travelProgress, setTravelProgress] = useState(0); // 0→1 across the arc
    const travelDuration = 2; // seconds to complete the bounce

    // Load models
    const originalModel = useLoader(GLTFLoader, `${process.env.PUBLIC_URL}/models/Head3.glb`);

    // Ensure shadows for the current model.
    useEffect(() => {
      if (currentModel) {
        currentModel.traverse((child) => {
          if (child) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }
    }, [currentModel]);

    // For simplicity, always use the original model.
    useEffect(() => {
      setCurrentModel(originalModel.scene);
    }, [shorten, originalModel]);

    // When targetPosition changes, record start/end positions.
    useEffect(() => {
      if(targetPosition && targetPosition.z > 5 && targetPosition.x > 5) return
      if (groupRef.current && targetPosition) {
        setStartPosition(groupRef.current.position.clone());
        setEndPosition(targetPosition.clone());
        setTravelProgress(0);
      }
    }, [targetPosition]);

    useFrame((state, delta) => {
      if (!groupRef.current || !currentModel) return;
      if (startPosition && endPosition) {
        setTravelProgress((prev) =>
          Math.min(prev + delta / travelDuration, 1)
        );
        const t = travelProgress;
        const newX = THREE.MathUtils.lerp(startPosition.x, endPosition.x, t);
        const newZ = THREE.MathUtils.lerp(startPosition.z, endPosition.z, t);
        const baseY = THREE.MathUtils.lerp(startPosition.y, endPosition.y, t);
        const totalDist = startPosition.distanceTo(endPosition);
        const amplitude = totalDist * 0.2;
        const yOffset = 4 * amplitude * t * (1 - t);

        groupRef.current.position.set(newX, baseY + yOffset, newZ);

        // Keep the head upright (adjust yaw only)
        groupRef.current.up.set(0, 1, 0);
        const deltaX = endPosition.x - groupRef.current.position.x;
        const deltaZ = endPosition.z - groupRef.current.position.z;
        const angle = Math.atan2(deltaX, deltaZ);
        groupRef.current.rotation.set(0, angle, 0);

        if (travelProgress >= 1) {
          setStartPosition(null);
          setEndPosition(null);
          setTravelProgress(0);
        }
      } else {
        // Normal mouse-based rotation.
        const { x, y } = state.mouse;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          x * 0.5,
          delta * 2
        );
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          -y * 0.5,
          delta * 2
        );
      }
    });

    // Expose the internal groupRef to parent via ref.
    React.useImperativeHandle(ref, () => groupRef.current as THREE.Group);

    return (
      currentModel && (
        <primitive
        zIndexRange={[16777271, 0]} 
          ref={groupRef}
          object={currentModel}
          position={[0, 2, 0]}
          castShadow
          onPointerOver={() => onHoverChange(true)}
          onPointerOut={() => onHoverChange(false)}
        />
      )
    );
  }
);

CartoonHead.displayName = "CartoonHead";

export default CartoonHead;
