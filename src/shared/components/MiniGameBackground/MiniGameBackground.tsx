import React, { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

interface MiniGameBackgroundProps {}

const MiniGameBackground: React.FC<MiniGameBackgroundProps> = () => {
  // Load textures (replace with your URLs)
  const backTexture = useLoader(TextureLoader, "https://raw.githubusercontent.com/Kageetai/mario-background-parallax/master/img/back.png?raw=true");
  const bushesTexture = useLoader(TextureLoader, "https://raw.githubusercontent.com/Kageetai/mario-background-parallax/master/img/bushes.png?raw=true");
  const groundTexture = useLoader(TextureLoader, "https://raw.githubusercontent.com/Kageetai/mario-background-parallax/master/img/ground.png?raw=true");
  // Optionally, load the mario layer if desired:
  // const marioTexture = useLoader(TextureLoader, "https://raw.githubusercontent.com/Kageetai/mario-background-parallax/master/img/mario.gif?raw=true");

  // Set the textures to repeat horizontally
  [backTexture, bushesTexture, groundTexture].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    // Optionally set repeat values here:
    // tex.repeat.set( number, number );
  });

  // Create refs to access the textures via their materials
  const backRef = useRef<THREE.Mesh>(null);
  const bushesRef = useRef<THREE.Mesh>(null);
  const groundRef = useRef<THREE.Mesh>(null);

  // Use frame loop to update texture offsets for parallax scrolling
  useFrame((state, delta) => {
    if (backTexture) {
      // Slow scroll for the far back layer
      backTexture.offset.x += delta * 0.01;
    }
    if (bushesTexture) {
      // Faster scroll for the bushes
      bushesTexture.offset.x += delta * 0.05;
    }
    if (groundTexture) {
      // Even faster scroll for the ground
    //   groundTexture.offset.x += delta * 0.1;
    }
  });

  return (
    <>
      {/* Back layer */}
      <mesh ref={backRef} position={[0, 0, -0]} scale={[0.05, 0.05, 0.05]}>
        <planeGeometry args={[512, 432]} />
        <meshBasicMaterial map={backTexture} transparent  side={2}/>
      </mesh>
      {/* Bushes layer */}
      {/* <mesh ref={bushesRef} position={[0, 0, -0]}>
        <planeGeometry args={[508, 79]} />
        <meshBasicMaterial map={bushesTexture} transparent />
      </mesh> */}
      {/* Ground layer */}
      <mesh ref={groundRef} position={[0, -8, 0.1] } scale={[0.05, 0.05,0.05]}>
        <planeGeometry args={[680, 220]} />
        <meshBasicMaterial map={groundTexture} transparent />
      </mesh>
    </>
  );
};

export default MiniGameBackground;
