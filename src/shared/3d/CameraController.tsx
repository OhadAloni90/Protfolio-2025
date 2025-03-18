import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrthographicCamera } from "@react-three/drei";

interface CameraControllerProps {
  shorten: boolean;
  tubeActive: boolean
  headRef: React.RefObject<THREE.Group | null>;
}

const CameraController: React.FC<CameraControllerProps> = ({ shorten, headRef,tubeActive }) => {
  const { camera } = useThree();
  // Orbit parameters.
  const orbitRadius = 6;
  const targetLookAt = new THREE.Vector3(0, 0, 0);
  const angleRef = useRef(0);
  const heightRef = useRef(0);
  // Offsets for repositioning the camera to keep the head in view.
  const cameraOffsetX = useRef(0);
  const cameraOffsetZ = useRef(0);
  const cameraOffsetY = useRef(0); // New vertical offset
  const regularCameraLogic = (delta: number)  => {
        // Normal orbit logic.
        const animationSpeed = delta * 0.5;
        angleRef.current = THREE.MathUtils.lerp(angleRef.current, shorten ? Math.PI : 0, animationSpeed);
        heightRef.current = THREE.MathUtils.lerp(heightRef.current, shorten ? 10 : 0, animationSpeed);
    
        const xOrbit = Math.sin(angleRef.current) * orbitRadius;
        const zOrbit = Math.cos(angleRef.current) * orbitRadius;
        const yOrbit = heightRef.current;
    
        // Update camera position with all offsets.
        camera.position.set(
          xOrbit + cameraOffsetX.current,
          yOrbit + cameraOffsetY.current,
          zOrbit + cameraOffsetZ.current
        );
        camera.lookAt(
          targetLookAt.x + cameraOffsetX.current,
          targetLookAt.y + cameraOffsetY.current,
          targetLookAt.z + cameraOffsetZ.current
        );
    
        // Check the head's screen-space position.
        if (headRef.current) {
          const headWorldPos = new THREE.Vector3();
          headRef.current.getWorldPosition(headWorldPos);
          const ndc = headWorldPos.clone().project(camera); // ndc.x, ndc.y ∈ [-1,1]
          // Adjust horizontal offset.
          if (ndc.x > 0.6) {
            cameraOffsetX.current -= 0.07; // Move camera left.
          } else if (ndc.x < -0.6) {
            cameraOffsetX.current += 0.07; // Move camera right.
          }
          // Adjust vertical offset.
          if (ndc.y > 0.6) {
            // Head is too high on the screen, so move the camera up (increasing Y offset) to bring it down.
            cameraOffsetZ.current += 0.1;
          } else if (ndc.y < -0.6) {
            // Head is too low on the screen, so move the caa down (decreasing Y offset) to bring it up.
            cameraOffsetZ.current -= 0.1;
          }
        }
    
  }
  const orthgonalCameraLogic = (delta: number) => {
      // Normal orbit logic.
      const animationSpeed = delta * 0.5;
    
      // Check the head's screen-space position.
      if (headRef.current) {
        const headWorldPos = new THREE.Vector3();
        headRef.current.getWorldPosition(headWorldPos);
        const ndc = headWorldPos.clone().project(camera); // ndc.x, ndc.y ∈ [-1,1]
        // Adjust horizontal offset.
        if (ndc.x > 0.6) {
          cameraOffsetX.current -= 0.07; // Move camera left.
        } else if (ndc.x < -0.6) {
          cameraOffsetZ.current += 0.07; // Move camera right.
        }
        // Adjust vertical offset.
        if (ndc.y > 0.6) {
          // Head is too high on the screen, so move the camera up (increasing Y offset) to bring it down.
          cameraOffsetZ.current += 0.1;
        } else if (ndc.y < -0.6) {
          // Head is too low on the screen, so move the caa down (decreasing Y offset) to bring it up.
          cameraOffsetZ.current -= 0.1;
        }
  
}
  }
  useFrame((_, delta) => {
    if (tubeActive) {
      camera.position.set(0, 2, 20);
      camera.lookAt(0, 0, 0);
      orthgonalCameraLogic(delta);

    } else {
      regularCameraLogic(delta);
    }
  });

  return null;
};


export default CameraController;
