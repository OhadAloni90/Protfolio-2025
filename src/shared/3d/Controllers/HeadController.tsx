// HeadController.tsx
import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MoveInput, PhysicsCartoonHeadHandle } from "../Physics/PhysicsCartoonHead";
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";

type HeadControllerProps = {
  headRef: React.MutableRefObject<PhysicsCartoonHeadHandle | null>;
  speed?: number;
  marioMode?: boolean;
  // Callback to spawn a fireball: provides the head's current position and a forward direction.
  onFireball?: (pos: THREE.Vector3, direction: THREE.Vector3) => void;
  // Only allow shooting if this is true (i.e. the player has the fireflower)
  canShoot?: boolean;
};

const HeadController: React.FC<HeadControllerProps> = ({
  headRef,
  speed = 0.1,
  onFireball,
  canShoot = false,
}) => {
  // Track key state (all keys are lowercased)
  const keysPressed = useRef<{ [key: string]: boolean }>({
    arrowleft: false,
    arrowright: false,
    arrowup: false,
    arrowdown: false,
    space: false,
    a: false,
    d: false,
    w: false,
    s: false,
  });
  const { state } = useGlobal();

  // Fireball cooldown in seconds.
  const lastFireballTime = useRef(0);
  const FIREBALL_COOLDOWN = 0.5;

  useEffect(() => {
    if (!state?.gameStarted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keysPressed.current) {
        keysPressed.current[key] = true;
      }
      if (e?.code?.toLowerCase() === 'space' && !state?.marioMode) {
        keysPressed.current.space = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keysPressed.current) {
        keysPressed.current[key] = false;
      }
      if (e?.code?.toLowerCase() === 'space' && !state?.marioMode) {
        keysPressed.current.space = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [state?.gameStarted, state?.marioMode]);

  useFrame((_, delta) => {
    if (!headRef.current) return;
    let input: MoveInput = {};
    // Process horizontal input.
    if (keysPressed.current.arrowleft || keysPressed.current.a) {
      input.left = true;
    } else if (keysPressed.current.arrowright || keysPressed.current.d) {
      input.right = true;
    }
    if (state?.marioMode) {
      if (keysPressed.current.arrowup || keysPressed.current.w) {
        input.jump = true;
        input.up = true;
      }
      headRef.current.setMoveInput(input);
    } else {
      if (keysPressed.current.arrowup || keysPressed.current.w) {
        input.up = true;
      } else if (keysPressed.current.arrowdown || keysPressed.current.s) {
        input.down = true;
      }
      if (keysPressed.current.space) {
        input.jump = true;
      }
      headRef.current.setMoveInput(input);
    }

    // Only allow firing if canShoot is true.
    if (onFireball && keysPressed.current.s && canShoot) {
      const now = performance.now() / 1000; // seconds
      if (now - lastFireballTime.current > FIREBALL_COOLDOWN) {
        lastFireballTime.current = now;
        // Get the head's world position.
        const headPos = new THREE.Vector3();
        headRef.current.getWorldPosition(headPos);
        // Determine fireball direction. For example, you can assume the head's forward is along +X.
        const direction = new THREE.Vector3(1, 0, 0);
        onFireball(headPos, direction);
      }
    }
  });

  return null;
};

export default HeadController;
