import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CameraControllerProps {
  shorten: boolean;
  tubeActive: boolean;
  lockCamera: boolean; // indicates "back" mode
  headRef: React.RefObject<THREE.Group | null>;
}

const CameraController: React.FC<CameraControllerProps> = ({
  shorten,
  tubeActive,
  lockCamera,
  headRef,
}) => {
  const { camera } = useThree();
  const orbitRadius = 6;
  const targetLookAt = new THREE.Vector3(0, 0, 0);
  const angleRef = useRef(0);
  const heightRef = useRef(0);
  const cameraOffsetX = useRef(0);
  const cameraOffsetZ = useRef(0);
  const cameraOffsetY = useRef(0);
  const fixedDistance = 5; // distance behind the head

  // Refs for the lerp transition.
  const lockedLerpStartRef = useRef<THREE.Vector3 | null>(null);
  const lockedLerpTargetRef = useRef<THREE.Vector3 | null>(null);
  const lerpProgressRef = useRef(0);
  const lerpSpeed = 0.5; // Adjust speed of the lerp

  // When lockCamera becomes true, capture the starting and target positions.
  useEffect(() => {
    if (lockCamera && headRef.current) {
      // Capture the current camera position.
      lockedLerpStartRef.current = camera.position.clone();
      // Compute target position relative to the head.
      const headWorldPos = new THREE.Vector3();
      headRef.current.getWorldPosition(headWorldPos);
      lockedLerpTargetRef.current = new THREE.Vector3(
        headWorldPos.x,
        headWorldPos.y,
        headWorldPos.z - fixedDistance
      );
      lerpProgressRef.current = 0;
    }
  }, [lockCamera, headRef, camera.position]);

  const regularCameraLogic = (delta: number) => {
    const animationSpeed = delta * 0.6;
    angleRef.current = THREE.MathUtils.lerp(
      angleRef.current,
      shorten ? Math.PI : 0,
      animationSpeed
    );
    heightRef.current = THREE.MathUtils.lerp(
      heightRef.current,
      shorten ? 10 : 0,
      animationSpeed
    );

    const xOrbit = Math.sin(angleRef.current) * orbitRadius;
    const zOrbit = Math.cos(angleRef.current) * orbitRadius;
    const yOrbit = heightRef.current;

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

    // Adjust offsets based on head's screen-space position.
    if (headRef.current) {
      const headWorldPos = new THREE.Vector3();
      headRef.current.getWorldPosition(headWorldPos);
      if (headWorldPos.z < -25 && cameraOffsetY.current < 7) {
        cameraOffsetY.current = THREE.MathUtils.lerp(
          cameraOffsetY.current,
          10,
          delta * 0.5
        );
      } else if (headWorldPos.z >= -25 && cameraOffsetY.current > 0) {
        cameraOffsetY.current = THREE.MathUtils.lerp(
          cameraOffsetY.current,
          0,
          delta * 0.5
        );
      }
      const ndc = headWorldPos.clone().project(camera);
      if (ndc.x > 0.6) {
        cameraOffsetX.current -= 0.07;
      } else if (ndc.x < -0.6) {
        cameraOffsetX.current += 0.07;
      }
      if (ndc.y > 0.6) {
        cameraOffsetZ.current += 0.1;
      } else if (ndc.y < -0.6) {
        cameraOffsetZ.current -= 0.1;
      }
    }
  };

  const marioCameraLogic = (delta: number) => {
    camera.position.set(
      cameraOffsetX.current,
      2 + cameraOffsetY.current,
      20
    );
    camera.lookAt(
      cameraOffsetX.current,
      cameraOffsetY.current,
      0
    );
    if (headRef.current) {
      const headWorldPos = new THREE.Vector3();
      headRef.current.getWorldPosition(headWorldPos);
      const ndc = headWorldPos.clone().project(camera);
      if (ndc.x > 0.5) {
        cameraOffsetX.current += 0.15;
      } else if (ndc.x < -0.5) {
        cameraOffsetX.current -= 0.15;
      }
      if (ndc.y > 0.6) {
        cameraOffsetY.current += 0.1;
      } else if (ndc.y < -0.6) {
        cameraOffsetY.current -= 0.1;
      }
    }
  };

  // Smoothly interpolate from the starting position to the target.
  const lockedCameraLogic = (delta: number) => {
    if (
      lockedLerpStartRef.current &&
      lockedLerpTargetRef.current &&
      headRef.current
    ) {
      // Increase progress over time.
      lerpProgressRef.current = Math.min(
        lerpProgressRef.current + delta * lerpSpeed,
        1
      );
      // Compute the interpolated position.
      camera.position.lerpVectors(
        lockedLerpStartRef.current,
        lockedLerpTargetRef.current,
        lerpProgressRef.current
      );
      // Always have the camera look at the head.
      const headWorldPos = new THREE.Vector3();
      headRef.current.getWorldPosition(headWorldPos);
      camera.lookAt(headWorldPos);
    }
  };

  useFrame((_, delta) => {
    if (lockCamera) {
      lockedCameraLogic(delta);
    } else if (tubeActive) {
      marioCameraLogic(delta);
    } else {
      regularCameraLogic(delta);
    }
  });

  return null;
};

export default CameraController;
