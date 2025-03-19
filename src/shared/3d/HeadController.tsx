import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MoveInput, PhysicsCartoonHeadHandle } from "./Physics/PhysicsCartoonHead";


type HeadControllerProps = {
  headRef: React.MutableRefObject<PhysicsCartoonHeadHandle | null>;
  speed?: number;
  marioMode?: boolean;
};

const HeadController: React.FC<HeadControllerProps> = ({
  headRef,
  speed = 0.1,
  marioMode = false,
}) => {
  // Track key state (all keys are lowercased)
  const keysPressed = useRef<{ [key: string]: boolean }>({
    arrowleft: false,
    arrowright: false,
    arrowup: false,   // for Mario mode jump only
    arrowDown: false,   // for Mario mode jump only
    space: false, //For jumping in 3d model
    a: false,
    d: false,
    w: false,       // for Mario mode jump only
    s: false
  });
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keysPressed.current) {
        keysPressed.current[key] = true;
      }
      if(e?.code?.toLowerCase() === 'space' && !marioMode) {
        keysPressed.current.space = true;
      }

    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keysPressed.current) {
        keysPressed.current[key] = false;
      } 
      if(e?.code?.toLowerCase() === 'space' && !marioMode) {
        keysPressed.current.space = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  useFrame((_, delta) => {
    if (!headRef.current) return;
    let input: MoveInput = {};
    // Always process horizontal input
    if (keysPressed.current.arrowleft || keysPressed.current.a) {
      input.left = true;
    } else if (keysPressed.current.arrowright || keysPressed.current.d) {
      input.right = true;
    } 
    // In Mario mode, use jump (up/W) input:
    if (marioMode) {
      if (keysPressed.current.arrowup || keysPressed.current.w) {
        input.jump = true;
        input.up = true;
      }
      // Use physics-based movement:
      headRef.current.setMoveInput(input);
    } else {
      // In Main scene, update horizontal position directly.
      // (Vertical position is controlled by physics or remains unchanged.)
      const head = headRef.current;
      if (keysPressed.current.arrowUp || keysPressed.current.w) {
        input.up = true;
      } else if (keysPressed.current.arrowDown || keysPressed.current.s) {
        input.down = true;
      }
      else if(keysPressed.current.space) {
        input.jump = true;
      }
      // Also call setMoveInput to update horizontal velocity if desired:
      head.setMoveInput(input);
    }
  });

  return null;
};

export default HeadController;
