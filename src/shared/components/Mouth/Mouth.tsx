import React, { useRef, useEffect, useState, useMemo, JSX } from "react";
import { Html, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useBox } from "@react-three/cannon";
import * as THREE from "three";
import ProgressBarWithImage from "../ProgressBar/ProgressBar";
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";

// Helper to merge multiple refs
function mergeRefs<T>(...refs: React.Ref<T>[]): React.RefCallback<T> {
  return (node: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<T>).current = node;
      }
    });
  };
}

const Mouth = (props: JSX.IntrinsicElements["group"]) => {
  const { scene } = useGLTF(`${process.env.PUBLIC_URL}/models/Mouth.glb`);
  const groupRef = useRef<THREE.Group>(null);

  // Compute bounding box of the scene to size the physics body.
  const bbox = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    return size;
  }, [scene]);

  // Create a kinematic physics body for the mouth.
  // We choose "Kinematic" because the mouth is animated manually.
  const [physicsRef, api] = useBox(() => ({
    type: "Kinematic",
    args: [bbox.x, bbox.y, bbox.z],
    position: props.position as [number, number, number],
    rotation: props.rotation as [number, number, number],
  }));
  

  // Local states for controlling the mouth animation.
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [spinProgress, setSpinProgress] = useState(0);
  const spinDuration = 1.5; // seconds
  const { state } = useGlobal();

  // Set up shadows and update material based on dark mode.
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshStandardMaterial({
          color: state.darkMode ? "#611424" : "#ffff",
          roughness: 0.5,
          metalness: 0.5,
        });
      }
    });
  }, [scene, state.darkMode]);

  // Animate rotation, position, and scale.
  useFrame((_, delta) => {
    if (!groupRef.current || !isSpinning) return;

    // Update spin progress.
    let newProgress: number;
    if (isClosing) {
      newProgress = Math.max(spinProgress - delta / spinDuration, 0);
    } else {
      newProgress = Math.min(spinProgress + delta / spinDuration, 1);
    }
    setSpinProgress(newProgress);

    // Calculate interpolated rotation.
    const initialRot = new THREE.Euler(0, Math.PI, 0);
    const finalRot = new THREE.Euler(Math.PI / 8, -Math.PI, 0);
    const currentRotX = THREE.MathUtils.lerp(initialRot.x, finalRot.x, newProgress);
    const currentRotY = THREE.MathUtils.lerp(initialRot.y, finalRot.y, newProgress);
    const currentRotZ = THREE.MathUtils.lerp(initialRot.z, finalRot.z, newProgress);
    groupRef.current.rotation.set(currentRotX, currentRotY, currentRotZ);

    // Calculate interpolated position.
    const initialPos = new THREE.Vector3(0, 3, 2);
    const finalPos = new THREE.Vector3(-6, 3, -2);
    const currentPos = new THREE.Vector3().lerpVectors(initialPos, finalPos, newProgress);
    groupRef.current.position.copy(currentPos);

    // Calculate interpolated scale.
    const initialScale = new THREE.Vector3(
      ...((props.scale as [number, number, number]) || [0.01, 0.01, 0.01])
    );
    const finalScale = new THREE.Vector3(0.03, 0.03, 0.03);
    const currentScale = new THREE.Vector3().lerpVectors(initialScale, finalScale, newProgress);
    groupRef.current.scale.copy(currentScale);

    // Update the physics body's transform to match the group.
    api.position.set(currentPos.x, currentPos.y, currentPos.z);
    api.rotation.set(currentRotX, currentRotY, currentRotZ);

    // Check if animation is complete.
    if (!isClosing && newProgress === 1) {
      setIsSpinning(false);
      setIsOpen(true);
    }
    if (isClosing && newProgress === 0) {
      setIsSpinning(false);
      setIsOpen(false);
      setIsClosing(false);
    }
  });

  // Click handler to trigger opening.
  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!isOpen && !isSpinning) {
      setIsOpen(false);
      setIsSpinning(true);
      setIsClosing(false);
      setSpinProgress(0);
    }
  };

  // Close handler for the overlay button.
  const handleClose = (e: any) => {
    e.stopPropagation();
    if (isOpen && !isSpinning) {
      setSpinProgress(1);
      setIsClosing(true);
      setIsSpinning(true);
      setIsOpen(false);
    }
  };

  return (
    <group {...props} ref={mergeRefs(groupRef, physicsRef)} onClick={handleClick}>
      <primitive object={scene} />
      {isOpen && (
        <Html
          center={true}
          // Adjust this offset as needed.
          position={[-150, 2, -100]}
          style={{ pointerEvents: "auto" }}
        >
          <div
            className="wave-letter mouth-text-panel"
            style={{ width: 300, background: "white", padding: "1rem" }}
          >
            <h2 className="wave-letter text text_med">Languages I Speak</h2>
            <p>
              Hebrew
              <ProgressBarWithImage progress={100} imageSrc="/path/to/your/image.png" />
            </p>
            <div>
              <p>
                English{" "}
                <ProgressBarWithImage progress={90} imageSrc="/path/to/your/image.png" />
              </p>
              <p>
                German
                <ProgressBarWithImage progress={20} imageSrc="/path/to/your/image.png" />
              </p>
            </div>
            <button onClick={handleClose}>Close</button>
          </div>
        </Html>
      )}
    </group>
  );
};

export default Mouth;
