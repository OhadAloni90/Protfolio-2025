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
        const animationSpeed = delta * 0.6;
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
          if (headRef.current) {
            const headWorldPos = new THREE.Vector3();
            headRef.current.getWorldPosition(headWorldPos);
          
            // When the head is far (z < -25), transition upward.
            if (headWorldPos.z < -25 && cameraOffsetY.current < 7) {
              cameraOffsetY.current = THREE.MathUtils.lerp(cameraOffsetY.current, 10, delta * 0.5);
            } 
            // When the head moves back (z >= -25), transition back to normal (e.g. offsetY = 0).
            else if (headWorldPos.z >= -25 && cameraOffsetY.current > 0) {
              cameraOffsetY.current = THREE.MathUtils.lerp(cameraOffsetY.current, 0, delta * 0.5);
            }
          }
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
          // console.log(cameraOffsetY.current)

        }
    
  }
  const marioCameraLogic = (delta: number) => {
    // In Mario mode (tubeActive), set a fixed base position,
    // then adjust horizontally as the head moves.
    // Here we use fixed base values (adjust as needed).
    camera.position.set(
      0 + cameraOffsetX.current,
      2 + cameraOffsetY.current,
      20
    );
    camera.lookAt(
      0 + cameraOffsetX.current,
      0 + cameraOffsetY.current,
      0
    );
    // Update offsets based on head's screen-space position.
    if (headRef.current) {
      const headWorldPos = new THREE.Vector3();
      headRef.current.getWorldPosition(headWorldPos);
      const ndc = headWorldPos.clone().project(camera);
      if (ndc.x > 0.5) {
        cameraOffsetX.current += 0.15; // pan left
      } else if (ndc.x < -0.5) {
        cameraOffsetX.current -= 0.15; // pan right
      }
      if (ndc.y > 0.6) {
        cameraOffsetY.current += 0.1; // pan up
      } else if (ndc.y < -0.6) {
        cameraOffsetY.current -= 0.1; // pan down
      }
    }
  };
  useFrame((_, delta) => {
    if (tubeActive) {
      camera.position.set(0, 2, 20);
      camera.lookAt(0, 0, 0);
      marioCameraLogic(delta);

    } else {
      regularCameraLogic(delta);
    }
  });

  return null;
};

export default CameraController;
