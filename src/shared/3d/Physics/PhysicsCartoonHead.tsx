import React, { forwardRef, useRef, useEffect, useImperativeHandle, useState } from "react";
import { useBox } from "@react-three/cannon";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export interface PhysicsCartoonHeadProps {
  onHoverChange: (hovering: boolean) => void;
  onCollide?: (e: any) => void;
  position?: [number, number, number];
  disableDrift?: boolean;
}

export interface PhysicsCartoonHeadHandle extends THREE.Group {
  setMoveInput: (input: MoveInput) => void;
}

export type MoveInput = {
  left?: boolean;
  right?: boolean;
  jump?: boolean;
  up?: boolean;
  down?: boolean;
};

const PhysicsCartoonHead = forwardRef<PhysicsCartoonHeadHandle, PhysicsCartoonHeadProps>(
  ({ onHoverChange, onCollide, position = [0, 0, 0], disableDrift }, ref) => {
    // Create a dynamic physics body for the head
    const [bodyRef, api] = useBox(() => ({
      type: "Dynamic",
      mass: 1,
      args: [1, 2, 1],
      position,
      friction: 1,
      collisionFilterGroup: 3,
      collisionFilterMask: 3 | 2,
      userData: { type: "head" },
      onCollide: (e) => {
        if (onCollide) onCollide(e);
      }
    }));

    const gltf = useLoader(GLTFLoader, "/models/Head3.glb");
    const [facing, setFacing] = useState<"left" | "right" | "up" | "down" | "jump">("right");

    // Create a ref to store the current velocity.
    const velocityRef = useRef<[number, number, number]>([0, 0, 0]);
    useEffect(() => {
      const unsubscribe = api.velocity.subscribe((v) => {
        velocityRef.current = v;
      });
      return unsubscribe;
    }, [api.velocity]);

    // Update movement based on user input.
 const setMoveInput = (input: MoveInput) => {
    const [vx, vy, vz] = velocityRef.current;
    let newVx = vx;
    let newVy = vy;
    let newVz = vz;
    if (disableDrift) {
      // Horizontal movement on X
      newVx = 0;
      if (input.left) {
        newVx = -5;
        setFacing("left");
      } else if (input.right) {
        newVx = 5;
        setFacing("right");
      }

      // Jump (up or jump key)
      if ((input.jump || input.up) && Math.abs(vy) < 0.01) {
        newVy = 8;
        setFacing("jump");
      }
      // No movement on Z
      newVz = 0;
    } else {
      // "topDown" mode
      // Move on X/Z plane, no jump by default
      newVx = 0;
      newVz = 0;
      if (input.left) {
        newVx = -5;
        setFacing("left");
      } else if (input.right) {
        newVx = 5;
        setFacing("right");
      }
      if (input.up) {
        newVz = -5; // forward is negative Z, or you can invert
        setFacing("up");
      } else if (input.down) {
        newVz = 5; // backward is positive Z
        setFacing("down");
      }
      // No jump in topDown mode (unless you want it).
      newVy = vy;
    }

    // Finally, set velocity
    api.velocity.set(newVx, newVy, newVz);
  };
    // Expose setMoveInput on our ref
    useImperativeHandle(ref, () => {
      const group = bodyRef.current as THREE.Group;
      (group as any).setMoveInput = setMoveInput;
      return group as PhysicsCartoonHeadHandle;
    });

    useFrame(() => {
      if (!bodyRef.current) return;
      const obj = bodyRef.current;
      obj.rotation.y = THREE.MathUtils.lerp(obj.rotation.y, facing === "left" ? 0 : Math.PI, 0.1);
    });

    useEffect(() => {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }, [gltf]);

    return (
      <group
        ref={bodyRef}
        onPointerOver={() => onHoverChange(true)}
        onPointerOut={() => onHoverChange(false)}
      >
        <primitive object={gltf.scene} />
      </group>
    );
  }
);

PhysicsCartoonHead.displayName = "PhysicsCartoonHead";
export default PhysicsCartoonHead;
