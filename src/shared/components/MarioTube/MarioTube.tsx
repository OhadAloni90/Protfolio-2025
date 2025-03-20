import React from "react";
import { useCylinder } from "@react-three/cannon";
import { useLoader } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
// If your model is FBX:
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
// Or if GLTF, import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface MarioTubeProps {
  position?: [number, number, number];
  onEnter: () => void;
}

const MarioTube: React.FC<MarioTubeProps> = ({ position = [5, 0, 0], onEnter }) => {
  // 1) Create a static cylinder collider for physics
  const [colliderRef] = useCylinder(() => ({
    type: "Static",
    args: [1.2, 1.2, 2, 32], // radiusTop, radiusBottom, height, radialSegments
    position: [position[0], position[1] + 1,position[2]],
    rotation: [0, 0, 0],
    userData: { type: "tube" },
    onCollide: (e) => {
      // if (e.body.userData?.type === "head") {
      //   onEnter();
      // }
    }
  }));

  // 2) Load the 3D model. (FBX example)
  const fbxModel = useLoader(FBXLoader, `${process.env.PUBLIC_URL}/models/mario-mini/MSteel_Pipe.fbx`);
  // If GLTF, do: const gltf = useLoader(GLTFLoader, "/models/MSteel_Pipe.glb");

  // 3) Load PBR textures
  // Adjust these paths to match your file structure
  const [
    diffuseMap,
    metalnessMap,
    roughnessMap,
    normalMap,
    displacementMap
  ] = useTexture([
    "/textures/mini-game/MSteel_Pipe_4K_Diffuse.png",
    "/textures/mini-game/MSteel_Pipe_4K_Metalness.png",
    "/textures/mini-game/MSteel_Pipe_4K_Roughness.png",
    "/textures/mini-game/MSteel_Pipe_4K_Normal.png",
    "/textures/mini-game/MSteel_Pipe_4K_Displacement.png",
  ]);

  // 5) We’ll apply these textures to the model’s mesh material(s).
  // If the model has multiple meshes, you might need to traverse them.

  // We’ll return a group that has the collider plus the loaded model
  return (
    <group>
      {/* Invisible physics collider */}
      <mesh ref={colliderRef} visible={false} />

      {/* The 3D model */}
      <primitive
        object={fbxModel}
        position={position}
        scale={[0.01, 0.01, 0.01]} // Adjust as needed
        onUpdate={(obj: THREE.Object3D) => {
          obj.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.name === "HP") {
                // Option 1: Hide the low-poly mesh
                mesh.visible = false;
        
                // Option 2: Or remove it from the scene:
                // mesh.parent?.remove(mesh);
              } else {
                // It's the "HP" mesh, apply your material
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
        }}
      />
    </group>
  );
};

export default MarioTube;
