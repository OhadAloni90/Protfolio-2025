import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useDarkMode } from "../providers/DarkModeProvider/DarkModeProvider";
import { useLocation } from "react-router";
import "./Scene.scss";
import { Debug, Physics } from "@react-three/cannon";
import CameraController from "./CameraController";
import ProfolioLoader from "../pages/Loader/Loader";
import MarioScene from "../components/MarioScene";
import MainScene from "./Scenes/MainScene";
import { PhysicsCartoonHeadHandle } from "./Physics/PhysicsCartoonHead";

const Scene = ({ onHeadHover }: { onHeadHover: (hovering: boolean) => void }) => {
  const { state } = useDarkMode();
  const sceneRef = useRef<THREE.Scene>(null);
  const location = useLocation();
  const shorten = location.pathname !== "/";
  // For the head jump
  const headRef = useRef<PhysicsCartoonHeadHandle | null>(null);
  const [inTube, setInTube] = useState(false);
  const [inMarioMode, setInMarioMode] = useState(false);

  const [items, setItems] = useState<Array<{ id: number; x: number; y: number; z: number }>>([]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(state.darkMode ? "black" : "#fff");
    }
  }, [state.darkMode]);
  const handleTubeEnter = () => {
    // Trigger a transition, e.g., fade to black
    setInTube(true);
  };
  const handleItemSpawn = (pos: THREE.Vector3) => {
    // Example: add an item to your state
    setItems((prev) => [...prev, { id: Math.random(), x: pos.x, y: pos.y, z: pos.z }]);
  };

  return (
    <div className="canvas">
      <Canvas
        linear
        camera={{
          fov: 75,
          aspect: window.innerWidth / window.innerHeight,
          near: 0.1,
          far: 1000,
          position: [0, 0, 6],
        }}
        shadows
      >
        <Suspense fallback={<ProfolioLoader />}>
          {/* Global lights */}
          <ambientLight intensity={4} />
          <directionalLight
            position={[-3, 10, -10]}
            intensity={10}
            scale={[1,1,3]}
            castShadow
            shadow-mapSize-width={1024 * 10}
            shadow-mapSize-height={1024 * 10}
            shadow-camera-left={-200}
            shadow-camera-right={200}
            shadow-camera-top={200}
            shadow-camera-bottom={-200}
          />
          <Physics iterations={10} gravity={[0, -9.8, 0]}>
            <Debug>
              <CameraController shorten={shorten} headRef={headRef} tubeActive={inMarioMode} />
              {inMarioMode ? (
                <MarioScene headRef={headRef} />
              ) : (
                <MainScene headRef={headRef} onMarioEnter={() => setInMarioMode(true)} onHeadHover={() => {}} />
              )}
            </Debug>
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
