import React, { useRef, useEffect, useState, JSX } from "react";
import { Html, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import ProgressBarWithImage from "../ProgressBar/ProgressBar";
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";

const Mouth = (props: JSX.IntrinsicElements["group"]) => {
  const { scene } = useGLTF(`${process.env.PUBLIC_URL}/models/Mouth.glb`);
  const groupRef = useRef<THREE.Group>(null);

  // State to track if the mouth is open (spun up), spinning, or closing (spinning back)
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [spinProgress, setSpinProgress] = useState(0);
  const spinDuration = 1.5; // seconds
  const { state } = useGlobal();
  // Enable shadows for all meshes
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Replace the material with a solid color MeshStandardMaterial
        child.material = new THREE.MeshStandardMaterial({
          color: state.darkMode ? "#611424" : "#ffff", // white in dark mode, darkish in light mode
          roughness: 0.5,
          metalness: 0.5,
        });
      }
    });
  }, [scene, state.darkMode]);
  

  // Animate rotation and scale on each frame
  useFrame((_, delta) => {
    if (!groupRef.current || !isSpinning) return;
    let newProgress: number;
    if (isClosing) {
      newProgress = Math.max(spinProgress - delta / spinDuration, 0);
    } else {
      newProgress = Math.min(spinProgress + delta / spinDuration, 1);
    }
    setSpinProgress(newProgress);

    // Rotation: from [0, 0, 0] to [0, 2π, 0]
    const initialRot = new THREE.Euler(0, Math.PI, 0);
    const finalRot = new THREE.Euler(Math.PI / 8, -Math.PI, 0);
    const currentRotX = THREE.MathUtils.lerp(initialRot.x, finalRot.x, newProgress);
    const currentRotY = THREE.MathUtils.lerp(initialRot.y, finalRot.y, newProgress);
    const currentRotZ = THREE.MathUtils.lerp(initialRot.z, finalRot.z, newProgress);
    groupRef.current.rotation.set(currentRotX, currentRotY, currentRotZ);

    // 2) POSITION
    const initialPos = new THREE.Vector3(0, 3, 2);
    const finalPos = new THREE.Vector3(-6, 3, -2);
    const currentPos = new THREE.Vector3().lerpVectors(initialPos, finalPos, newProgress);
    groupRef.current.position.copy(currentPos);
    // position={[0, 3, 2]} scale={[0.01, 0.01, 0.01]}
    // Scale: from the initial scale (provided via props or default) to a larger value.
    // For example, initial scale of [0.01, 0.01, 0.01] expands to [0.1, 0.1, 0.1].
    const initialScale = new THREE.Vector3(...((props.scale as [number, number, number]) || [0.01, 0.01, 0.01]));
    const finalScale = new THREE.Vector3(0.03, 0.03, 0.03);
    const currentScale = new THREE.Vector3().lerpVectors(initialScale, finalScale, newProgress);
    groupRef.current.scale.copy(currentScale);

    // Check if animation is complete.
    if (!isClosing && newProgress === 1) {
      // Fully opened
      setIsSpinning(false);
      setIsOpen(true);
    }
    if (isClosing && newProgress === 0) {
      // Fully closed
      setIsSpinning(false);
      setIsOpen(false);
      setIsClosing(false);
    }
  });

  // Click handler to start opening.
  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!isOpen && !isSpinning) {
      setIsOpen(false);
      setIsSpinning(true);
      setIsClosing(false);
      setSpinProgress(0);
    }
  };

  // Close handler (triggered by the button in the HTML overlay)
  const handleClose = (e: any) => {
    e.stopPropagation();
    if (isOpen && !isSpinning) {
      // Reset progress to 1 (fully open) before starting reverse animation.
      setSpinProgress(1);
      setIsClosing(true);
      setIsSpinning(true);
      setIsOpen(false);
    }
  };

  return (
    <group {...props} ref={groupRef} onClick={handleClick}>
      <primitive object={scene} />
      {isOpen && (
        <Html
          center={true}
          // Adjust this offset so the overlay appears in the desired location relative to the mouth.
          position={[-150, 2, -100]}
          style={{ pointerEvents: "auto" }}
        >
          <div className="wave-letter mouth-text-panel" style={{ width: 300, background: "white", padding: "1rem" }}>
            <h2 className="wave-letter text text_med">Languages I Speak</h2>
            <p>
              Hebrew
              <ProgressBarWithImage progress={100} imageSrc="/path/to/your/image.png" />
            </p>
            <div>
              <p>
                English <ProgressBarWithImage progress={90} imageSrc="/path/to/your/image.png" />
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
