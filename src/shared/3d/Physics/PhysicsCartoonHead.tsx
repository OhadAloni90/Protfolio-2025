import React, { forwardRef, useRef, useEffect, useImperativeHandle, useState } from "react";
import { useBox } from "@react-three/cannon";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import * as CANNON from "cannon-es";
export interface PhysicsCartoonHeadProps {
  onHoverChange: (hovering: boolean) => void;
  onCollide?: (e: any) => void;
  position?: [number, number, number];
  disableDrift?: boolean;
  scale?: [number, number,number]
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
  space?:boolean;
};

const PhysicsCartoonHead = forwardRef<PhysicsCartoonHeadHandle, PhysicsCartoonHeadProps>(
  ({ onHoverChange, onCollide, position = [0, 0, 0], disableDrift, scale }, ref) => {
    // Create a dynamic physics body for the head
    const [bodyRef, api] = useBox<THREE.Group>(
      () => ({
        type: "Dynamic",
        mass: 10000,
        args: scale ?? [1, 2.2, 1],
        position,
        friction: 1,
        collisionFilterGroup: 3,
        collisionFilterMask: 3 | 2,
        userData: { type: "head" },
        onCollide,
      }),
      undefined,      // no forwarded ref is provided here
      [scale]         // dependency array to rebuild the body when scale changes
        );
    
    

    const gltf = useLoader(GLTFLoader, "./models/Head3.glb");
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
        // Mario mode: Only horizontal (X) movement and jump on Y.
        newVx = 0;
        if (input.left) {
          newVx = -5;
          setFacing("left");
        } else if (input.right) {
          newVx = 5;
          setFacing("right");
        }
    
        // Jump is only triggered via the jump input (ignore input.up)
        if (input.jump && Math.abs(vy) < 0.01) {
          newVy = 8; // jump speed
          setFacing("jump");
        }
        // Ensure no movement on Z.
        newVz = 0;
      } else {
        // Top-down (free) mode: Movement on X and Z (vertical via up/down).
        newVx = 0;
        newVz = 0;
        if (input.left) {
          newVx = 4;
          setFacing("left");
        } else if (input.right) {
          newVx = -4;
          setFacing("right");
        }
        if (input.up) {
          newVz = 4; // forward is negative Z, or adjust as needed
          setFacing("up");
        } else if (input.down) {
          newVz = -4;
          setFacing("down");
        } else if (input.jump) {
          newVy = 10;
          setFacing("jump");
        }
      }
    
      // Finally, update the physics velocity.
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
