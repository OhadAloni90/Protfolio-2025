import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type HeadControllerProps = {
  headRef: React.MutableRefObject<THREE.Object3D | null>;
  speed?: number;
  isOnBrick?:boolean
};

const HeadController: React.FC<HeadControllerProps> = ({ headRef, speed = 0.1 , isOnBrick}) => {
  // Track key state (all keys are lowercased)
  const keysPressed = useRef<{ [key: string]: boolean }>({
    arrowleft: false,
    arrowright: false,
    arrowup: false,
    a: false,
    d: false,
    w: false,
  });

  // Keep track of the last direction we faced: "left" or "right"
  const facingDirection = useRef<"left" | "right" | null>(null);

  // Jump variables
  const isJumping = useRef(false);
  const verticalVelocity = useRef(0);
  const gravity = 20; // tweak gravity
  const groundY = -1; // ground level
  const jumpAudio = useRef<HTMLAudioElement>(new Audio("music/mario_jump.mp3")); 

  useEffect(() => {
    // Configure the jump sound (e.g., volume, loop)
    jumpAudio.current.volume = 0.5;
    jumpAudio.current.loop = false;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keysPressed.current) {
        keysPressed.current[key] = true;
      }
      // Trigger jump with W or ArrowUp if not already jumping
      if ((key === "arrowup" || key === "w") && !isJumping.current) {
        isJumping.current = true;
        verticalVelocity.current = 9; // initial jump speed
        jumpAudio.current.currentTime = 0;
        jumpAudio.current.play();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keysPressed.current) {
        keysPressed.current[key] = false;
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
    const head = headRef.current;

    // Horizontal movement
    if (keysPressed.current.arrowleft || keysPressed.current.a) {
      head.position.x -= speed;
      facingDirection.current = "left";
    } else if (keysPressed.current.arrowright || keysPressed.current.d) {
      head.position.x += speed;
      facingDirection.current = "right";
    }

    // Lerp to the last known direction, even if the user released the key
    if (facingDirection.current === "left") {
      // Lerp to Y rotation = 0 (facing left)
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0, 0.2);
    } else if (facingDirection.current === "right") {
      // Lerp to Y rotation = π (facing right)
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, Math.PI, 0.6);
    }

    // Jumping logic
    if (isJumping.current) {
      head.position.y += verticalVelocity.current * delta;
      verticalVelocity.current -= gravity * delta;
      if (head.position.y <= groundY) {
        head.position.y = groundY;
        isJumping.current = false;
        verticalVelocity.current = 0;
      }
    }
    
  });

  return null;
};

export default HeadController;
