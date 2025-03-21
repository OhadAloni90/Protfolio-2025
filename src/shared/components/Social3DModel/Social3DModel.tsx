import React, { useRef, useState } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Html, useDepthBuffer } from '@react-three/drei';
import { useGlobal } from '../../providers/DarkModeProvider/DarkModeProvider';

interface Social3DModelProps {
  modelUrl: string;
  modelType: 'glb' | 'fbx';
  position?: [number, number, number];
  rotation?: [number, number, number];
  // This scale is applied visually and used in the bounding box calculation.
  scale?: [number, number, number] | number;
  textureUrl?: string;
  mass?: number;
  // URL to navigate to on click (for example, a Facebook profile).
  linkUrl?: string;
}

const Social3DModel: React.FC<Social3DModelProps> = ({
  modelUrl,
  modelType,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  textureUrl,
  mass = 1,
  linkUrl,
}) => {
  const [hovered, setHovered] = useState(false);
    const {state} = useGlobal();
  // Load the model using the appropriate loader.
  const model: any = useLoader(
    modelType === 'glb' ? GLTFLoader : FBXLoader,
    modelUrl
  );
  let light = useRef<THREE.SpotLight>(null);
  // Load texture if provided.
  const texture = React.useMemo(() => {
    if (!textureUrl) return null;
    return new THREE.TextureLoader().load(textureUrl);
  }, [textureUrl]);

  // Helper function to traverse and apply texture and set shadows.
  const applyTexture = (object: THREE.Object3D) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        child.castShadow = true;
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if ('map' in mat) {
              (mat as THREE.MeshStandardMaterial).map = texture;
              mat.needsUpdate = true;
            }
          });
        } else {
          if ('map' in child.material) {
            (child.material as THREE.MeshStandardMaterial).map = texture;
            child.material.needsUpdate = true;
          }
        }
      }
    });
  };

  // Apply texture to the model if available.
  if (texture) {
    if ('scene' in model && model.scene) {
      applyTexture(model.scene);
    } else {
      applyTexture(model);
    }
  }

  // Determine which object to render: for GLB models, use model.scene; for FBX, use the model.
  const objectToRender = 'scene' in model && model.scene ? model.scene : model;


  // Compute the bounding box of the model, its size, and center offset.
  const { colliderArgs, offset } = React.useMemo(() => {
    if (!objectToRender) {
      return { colliderArgs: [1, 1, 1] as [number, number, number], offset: new THREE.Vector3() };
    }
    const box = new THREE.Box3().setFromObject(objectToRender);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    // Apply the visual scale to both size and center.
    if (typeof scale === 'number') {
      size.multiplyScalar(scale);
      center.multiplyScalar(scale);
    } else {
      size.set(size.x * scale[0], size.y * scale[1], size.z * scale[2]);
      center.set(center.x * scale[0], center.y * scale[1], center.z * scale[2]);
    }
    // useBox expects half-extents, so divide size by 2.
    return { colliderArgs: [size.x, size.y, size.z] as [number, number, number], offset: center };
  }, [objectToRender, scale]);

  // Create a physics body using useBox with the computed collider arguments.
  const [ref] = useBox(() => ({
    type: 'Static',
    mass,
    position,
    rotation,
    args: colliderArgs,
  }));

  // Calculate interactive scale (slightly larger when hovered).
  const interactiveScale =
    typeof scale === 'number'
      ? scale * (hovered ? 1.1 : 1)
      : Array.isArray(scale)
      ? (scale as [number, number, number]).map(val => hovered ? val * 1.1 : val) as [number, number, number]
      : scale;

  return (
    <group
      ref={ref}
      onPointerOver={(e) => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
        e.stopPropagation();
      }}
      onPointerOut={(e) => {
        setHovered(false);
        document.body.style.cursor = 'default';
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (linkUrl) {
          window.open(linkUrl, '_blank');
        }
      }}
    >
      {/* Offset the model by the negative center so that its geometry is re-centered relative to the physics collider */}
      <group position={[-offset.x, -offset.y, -offset.z]}>
        <primitive
          object={objectToRender}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          scale={interactiveScale}
        />
      </group>
      {
        hovered &&       <Html transform >
        <div className={`text text_bold text_big text_title_big ${state?.darkMode ? 'dark' : 'light'}`}>
            Click to open in a new tab
        </div>
      </Html>
      }
    </group>
  );
};

export default Social3DModel;
