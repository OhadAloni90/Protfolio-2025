import React from 'react';
import { useLoader } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

interface Social3DModelProps {
  modelUrl: string;
  modelType: 'glb' | 'fbx';
  position?: [number, number, number];
  rotation?: [number, number, number];
  // This scale is applied visually and used in the bounding box calculation.
  scale?: [number, number, number] | number;
  textureUrl?: string;
  mass?: number;
}

const Social3DModel: React.FC<Social3DModelProps> = ({
  modelUrl,
  modelType,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  textureUrl,
  mass = 1,
}) => {
  // Load the model using the appropriate loader.
  const model: any = useLoader(
    modelType === 'glb' ? GLTFLoader : FBXLoader,
    modelUrl
  );

  // Load texture if provided.
  const texture = React.useMemo(() => {
    if (!textureUrl) return null;
    return new THREE.TextureLoader().load(textureUrl);
  }, [textureUrl]);

  // Helper function to traverse the model and apply texture.
  const applyTexture = (object: THREE.Object3D) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // set shadows
        child.receiveShadow = true
        child.castShadow = true
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

  // Compute the bounding box of the model and adjust it by the scale.
  const computedColliderArgs: [number, number, number] = React.useMemo(() => {
    if (!objectToRender) return [1, 1, 1];
    const box = new THREE.Box3().setFromObject(objectToRender);
    const size = new THREE.Vector3();
    box.getSize(size);
    // Apply visual scale to the size.
    if (typeof scale === 'number') {
      size.multiplyScalar(scale);
    } else {
      size.set(size.x, size.y, size.z );
    }
    // useBox expects half-extents so we divide by 2.
    return [size.x, size.y, size.z] as [number, number, number];
  }, [objectToRender, scale]);

  // Create a physics body using useBox with the computed collider arguments.
  const [ref] = useBox(() => ({
    type: 'Static',
    mass,
    position,
    rotation,
    args: computedColliderArgs,
  }));

  return (
    <group ref={ref}>
      <primitive
        object={objectToRender}
        // Reset local transform so the physics body controls the overall transform.
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={scale}
      />
    </group>
  );
};

export default Social3DModel;
