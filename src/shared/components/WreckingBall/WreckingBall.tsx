import React, { forwardRef, useEffect, useRef } from "react";
import { useSphere, useDistanceConstraint } from "@react-three/cannon";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";

export interface WreckingBallProps {
  ballPosition?: [number, number, number]; // Initial position of the ball
  pivotPosition?: [number, number, number];  // Position of the pivot (e.g. ceiling)
  ropeLength?: number; // The fixed distance between pivot and ball
  radius?: number;
  mass?: number;
  color?: string;
  ropeColor?: string;
  onWallCollide?: (e: any) => void; // Callback when the ball collides with a wall
}

export interface WreckingBallRef {
  api: ReturnType<typeof useSphere>[1];
  ball: THREE.Mesh | null;
}

const WreckingBall = forwardRef<WreckingBallRef, WreckingBallProps>(
  (
    {
      ballPosition = [0, -5, 0],
      pivotPosition = [0, 0, 0],
      ropeLength = 3,
      radius = 1,
      mass = 30,
      color = "gray",
      ropeColor = "black",
      onWallCollide,
    },
    ref
  ) => {
    // Load a metal texture for the wrecking ball.
    const metalTexture = useLoader(TextureLoader, "/textures/metal_texture.avif");

    // Create a dynamic sphere for the ball.
    const [ballRef, ballApi] = useSphere(() => ({
      mass: mass,
      position: ballPosition,
      args: [radius],
      angularDamping: 0.1,
      linearDamping: 0.1,
      userData: { type: "wreckingBall" },
      onCollide: (e: any) => {
        const otherType = e.body.userData?.type;
        if (otherType === "head") {
          ballApi.velocity.set(0, 0, 0);
          return;
        }
        if (otherType === "vertical") {
          onWallCollide && onWallCollide(e);
        }
      },
    }));

    // Create a static sphere for the pivot point.
    const [pivotRef] = useSphere(() => ({
      mass: 0,
      position: pivotPosition,
      args: [0.1],
    }));

    // Constrain the ball to the pivot using a distance constraint.
    useDistanceConstraint(ballRef, pivotRef, { distance: ropeLength });

    // Create a ref for the rope (modeled as a cylinder)
    const ropeRef = useRef<THREE.Mesh>(null);

    // Create a cylinder geometry for the rope.
    // The cylinder is created with a height of 1 unit and will be scaled along the y-axis.
    const ropeGeometry = useRef(new THREE.CylinderGeometry(0.02, 0.02, 1, 8)).current;

    // Create a standard material for the rope.
    const ropeMaterial = useRef(new THREE.MeshStandardMaterial({ color: ropeColor })).current;

    // Update the rope’s position, scale, and orientation on every frame.
    useFrame(() => {
      if (ballRef.current && pivotRef.current && ropeRef.current) {
        const ballPos = new THREE.Vector3();
        const pivotPos = new THREE.Vector3();
        ballRef.current.getWorldPosition(ballPos);
        pivotRef.current.getWorldPosition(pivotPos);

        // Compute the distance between pivot and ball.
        const distance = pivotPos.distanceTo(ballPos);

        // Find the midpoint between pivot and ball.
        const midPoint = new THREE.Vector3().addVectors(ballPos, pivotPos).multiplyScalar(0.5);
        ropeRef.current.position.copy(midPoint);

        // Update the rope's scale along the y-axis to match the distance.
        // The default cylinder height is 1, so scaling y by the distance works.
        ropeRef.current.scale.set(1, distance, 1);

        // Compute the direction from the pivot to the ball.
        const direction = new THREE.Vector3().subVectors(ballPos, pivotPos).normalize();

        // The default cylinder in Three.js is oriented along the positive Y axis (0,1,0).
        // Create a quaternion that rotates the cylinder from the Y-axis to the computed direction.
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        ropeRef.current.quaternion.copy(quaternion);
      }
    });

    // Update ball position when ballPosition prop changes (ignoring only vertical changes).
    const prevBallPos = useRef<[number, number, number]>(ballPosition);
    useEffect(() => {
      if (ballRef.current) {
        const newPos = new THREE.Vector3(...ballPosition);
        const oldPos = new THREE.Vector3(...prevBallPos.current);
        const epsilon = 0.001;
        if (
          Math.abs(newPos.x - oldPos.x) < epsilon &&
          Math.abs(newPos.z - oldPos.z) < epsilon
        ) {
          return;
        }
        ballApi.position.set(...ballPosition);
        prevBallPos.current = ballPosition;
      }
    }, [ballPosition, ballApi]);

    // Expose the ball's physics API and its Mesh via the forwarded ref.
    React.useImperativeHandle(ref, () => ({
      api: ballApi,
      ball: ballRef.current as THREE.Mesh,
    }));

    return (
      <>
        {/* The dynamic wrecking ball */}
        <mesh ref={ballRef} castShadow receiveShadow>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            map={metalTexture}
            metalness={0.5}
            roughness={0.4}
            color={color}
          />
        </mesh>

        {/* The pivot (invisible by default; set visible to true for debugging) */}
        <mesh ref={pivotRef} visible={false}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="red" />
        </mesh>

        {/* The rope rendered as a thin cylinder */}
        <mesh
          ref={ropeRef}
          geometry={ropeGeometry}
          material={ropeMaterial}
          castShadow
          receiveShadow
        />
      </>
    );
  }
);

WreckingBall.displayName = "WreckingBall";
export default WreckingBall;
