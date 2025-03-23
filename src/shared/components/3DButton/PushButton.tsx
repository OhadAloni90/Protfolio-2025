import React, { forwardRef, useRef, useEffect, useState } from "react";
import { Html, Text, useGLTF, useAnimations } from "@react-three/drei";
import { useBox } from "@react-three/cannon";
import * as THREE from "three";
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";

export interface PhysicsPushButtonProps {
  text?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  dialogOpen?: boolean;
  onCloseDialog?: () => void;
  dialogContent?: React.ReactNode;
  dialog: { width: string; height: string };
}

const PhysicsPushButton = forwardRef<THREE.Group, PhysicsPushButtonProps>(
  (
    {
      text = "PUSH",
      position = [0, 0, 0],
      rotation = [0, 0, 0],
      scale = [1, 1, 1],
      dialogOpen = false,
      onCloseDialog,
      dialogContent,
      dialog,
    },
    ref
  ) => {
    const groupRef = useRef<THREE.Group>(null);
    // Create a physics body for the button.
    // Here, the button is static (it doesn't move), but it can still detect collisions.
    const [physicsRef, api] = useBox(() => ({
      type: "Static",
      args: [1, 1, 1], // adjust the size as needed
      position,
      rotation,
      userData: { type: "pushButton" },
    }));

    // Expose the internal ref to the parent.
    React.useImperativeHandle(ref, () => groupRef.current as THREE.Group);

    const { state } = useGlobal();
    // Load the button GLTF file
    const { scene, animations } = useGLTF(`${process.env.PUBLIC_URL}/models/button.glb`);
    const { actions } = useAnimations(animations, groupRef);

    // Play an idle animation if available.
    useEffect(() => {
      if (actions && actions.idle) {
        actions.idle.play();
      }
    }, [actions]);

    const [isPressed, setIsPressed] = useState(false);

    const handlePointerDown = (e: any) => {
      e.stopPropagation();
      setIsPressed(true);
      if (actions && actions.press) {
        actions.press.reset().play();
      }
    };

    const handlePointerUp = (e: any) => {
      e.stopPropagation();
      setIsPressed(false);
      if (actions && actions.release) {
        actions.release.reset().play();
      }
    };

    return (
      <group ref={physicsRef} position={position} rotation={rotation} scale={scale}>
        {/* Attach the physics body to the group by spreading the physicsRef onto the model */}
        <primitive
          object={scene}
          ref={physicsRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        />
        {/* Add text overlay */}
        <Text
          castShadow
          rotation={[Math.PI / 2, Math.PI, 0]}
          position={[-0.01, 0.05, 0.05]}
          fontSize={0.05}
          font={`${process.env.PUBLIC_URL}/fonts/AmaticSC-Bold.ttf`}
          color={!state?.darkMode ?  '#000' : '#fff'}
          anchorX="center"
          anchorY="middle"
          fontWeight={800}
        >
          {text}
        </Text>
        {/* Dialog with HTML content */}
        {dialogOpen && (
          <Html center position={[1, -5, 3]} style={{ pointerEvents: "auto" , zIndex: 3}}  >
            <div
              className={`dialog-container ${state.darkMode ? "dark" : "light"}`}
              style={{
                background: state.darkMode ? "black" : "white",
                width: dialog.width,
                height: dialog.height,
              }}
            >
              {dialogContent}
              <div className="dialog-footer">
                <button onClick={() => onCloseDialog && onCloseDialog()}>
                  Close
                </button>
              </div>
            </div>
          </Html>
        )}
      </group>
    );
  }
);

PhysicsPushButton.displayName = "PhysicsPushButton";
export default PhysicsPushButton;
