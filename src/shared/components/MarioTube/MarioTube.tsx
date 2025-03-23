import React from "react";
import { useCylinder } from "@react-three/cannon";
import { useLoader } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";

interface MarioTubeProps {
  position?: [number, number, number];
  onEnter: () => void;
}

const MarioTube: React.FC<MarioTubeProps> = ({ position = [5, 0, 0], onEnter }) => {
  // 1) Outer Collider: This will block the head from entering.
  const [outerColliderRef] = useCylinder(() => ({
    type: "Static",
    args: [1.2, 1.2, 5, 32], // radiusTop, radiusBottom, height, segments
    position: [position[0], position[1] - 1 , position[2]],
    rotation: [0, 0, 0],
    userData: { type: "tubeOuter" },
  }));
  
  // 2) Inner Trigger: This ring is positioned inside the tube.
  // It does not produce a collision response (so the head won’t be blocked)
  // but will trigger onCollide when the head touches it.
  const [innerTriggerRef] = useCylinder(() => ({
    type: "Static",
    args: [1, 1, 0.2, 32], // a smaller radius and thin height creates a ring-like collider
    position: [position[0], position[1] + 3, position[2]], // same center as tube
    rotation: [0, 0, 0],
    userData: { type: "tubeTrigger" },
    collisionResponse: false,
    onCollide: (e) => {
      // Check that the colliding body is the head
      if (e.body.userData?.type === "head") {
        onEnter();
      }
    },
  }));

  // 3) Load the FBX model for the tube
  const fbxModel = useLoader(FBXLoader, `${process.env.PUBLIC_URL}/models/mario-mini/MSteel_Pipe.fbx`);
  
  // 4) Load textures for a PBR material
  const [
    diffuseMap,
    metalnessMap,
    roughnessMap,
    normalMap,
    displacementMap,
  ] = useTexture([
    `${process.env.PUBLIC_URL}/textures/mini-game/MSteel_Pipe_4K_Diffuse.png`,
    `${process.env.PUBLIC_URL}/textures/mini-game/MSteel_Pipe_4K_Metalness.png`,
    `${process.env.PUBLIC_URL}/textures/mini-game/MSteel_Pipe_4K_Roughness.png`,
    `${process.env.PUBLIC_URL}/textures/mini-game/MSteel_Pipe_4K_Normal.png`,
    `${process.env.PUBLIC_URL}/textures/mini-game/MSteel_Pipe_4K_Displacement.png`,
  ]);

  // 5) Apply the textures and material to the model.
  const onModelUpdate = (obj: THREE.Object3D) => {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Hide low-poly helper meshes if needed (e.g., a mesh named "HP")
        if (mesh.name === "HP") {
          mesh.visible = false;
        } else {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.material = new THREE.MeshStandardMaterial({
            map: diffuseMap,
            metalnessMap,
            roughnessMap,
            normalMap,
            displacementMap,
            displacementScale: 0.01,
            metalness: 1,
            roughness: 1.4,
          });
        }
      }
    });
  };
  const {state} = useGlobal();
  return (
    <group>
      {/* Outer collider (invisible) to block the head */}
      <mesh ref={outerColliderRef} visible={false} />

      {/* Inner trigger collider (invisible) that starts the game */}
      <mesh ref={innerTriggerRef} visible={false} />

      {/* 3D model of the tube */}
      <primitive
        object={fbxModel}
        position={position}
        scale={[0.01, 0.01, 0.01]} // Adjust scale as needed
        onUpdate={onModelUpdate}
      />
      <Text position={[position[0],position[1] + 1,position[2] - 2]} rotation={[0, Math.PI,0 ]}   fontSize={2}
      fontWeight={'bold'}
        color={!state?.darkMode ? '#000': '#fff'}
        font={`${process.env.PUBLIC_URL}/fonts/AmaticSC-Bold.ttf`}
      >Contact & play!</Text>
            <Text position={[position[0],position[1] -0.5 ,position[2] - 2]} rotation={[0, Math.PI,0 ]}   fontSize={1.2}
      fontWeight={'bold'}
        color={!state?.darkMode ? '#000': '#fff'}
        font={`${process.env.PUBLIC_URL}/fonts/AmaticSC-Bold.ttf`}
      >Jump inside...</Text>

    </group>
  );      

};

export default MarioTube;
