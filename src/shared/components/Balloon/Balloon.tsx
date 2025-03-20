import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BalloonProps {
  onExplode?: () => void;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

const Balloon: React.FC<BalloonProps> = ({
  onExplode,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
}) => {
  const { scene, animations } = useGLTF(`${process.env.PUBLIC_URL}models/balloon.glb`);
  const { actions } = useAnimations(animations, scene);
  const balloonRef = useRef<THREE.Group>(null);
  const [exploded, setExploded] = useState(false);

  // Log animations to check clip names.
  useEffect(() => {
  }, [animations]);

  // On click, trigger explosion if not already exploded.
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (!exploded && actions["Object_0"]) {
      actions["Object_0"].reset();
      // Configure to play only once and clamp at the last frame.
      actions["Object_0"].setLoop(THREE.LoopOnce, 1);
      actions["Object_0"].clampWhenFinished = true;
      actions["Object_0"].play();
      setExploded(true);
      onExplode && onExplode();
    }
  };

  // useFrame to monitor animation progress.
  useFrame(() => {
    if (exploded && actions["Object_0"]) {
      const clip = actions["Object_0"].getClip();
      // When the animation reaches the end, simply let it stay at the final frame.
      if (actions["Object_0"].time >= clip.duration) {
        // Do not stop the action – leaving it playing with clampWhenFinished true 
        // will freeze the model at its final (exploded) state.
        // Optionally, you can spawn debris here.
        // Do not reset the exploded flag, so subsequent clicks do not replay the explosion.
      }
    }
  });
 
  return (
    <group
      ref={balloonRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerDown={handlePointerDown}
    >
      <primitive object={scene} />
    </group>
  );
};

export default Balloon;
