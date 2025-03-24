import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGlobal } from "../providers/DarkModeProvider/DarkModeProvider";
import { useLocation } from "react-router";
import "./Scene.scss";
import { Debug, Physics } from "@react-three/cannon";
import CameraController from "./Controllers/CameraController";
import ProfolioLoader from "../pages/Loader/Loader";
import MarioScene from "./Scenes/MarioScene";
import MainScene from "./Scenes/MainScene";
import { PhysicsCartoonHeadHandle } from "./Physics/PhysicsCartoonHead";
import KeyboardExplaining from "../components/KeyboardExplaining/KeyboardExplaining";
import { SpotLight } from "@react-three/drei";

const Scene = ({ onHeadHover }: { onHeadHover: (hovering: boolean) => void }) => {
  let sceneRef = useRef<THREE.Scene>(null);
  let rendererRef = useRef<THREE.WebGLRenderer>(null);
  const location = useLocation();
  const shorten = location.pathname !== "/";
  // For the head jump
  const headRef = useRef<PhysicsCartoonHeadHandle | null>(null);
  const [inTube, setInTube] = useState(false);
  const [items, setItems] = useState<Array<{ id: number; x: number; y: number; z: number }>>([]);
  const { dispatch, state } = useGlobal();
  const light = useRef(null)

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(state.darkMode ? "#001F24" : "#fff");
    }
    if (rendererRef.current) {
      // rendererRef.current.toneMapping = THREE.NoToneMapping;
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
  const setMarioIn = () => {
    dispatch({ type: "SET_MARIO_MODE" });
  };
  

  return (
    <>
      <div className="canvas">
        <Canvas
          dpr={[1, 2]} // Clamp the pixel ratio between 1 and 2
          onCreated={({ scene, gl }) => {
            sceneRef.current = scene;
            rendererRef.current = gl;
          }}
          linear
          camera={{
            fov: 75,
            aspect: window.innerWidth / window.innerHeight,
            near: 0.1,
            far: 1000,
            position: [0, 0, 6],
          }}
          shadows
          color="blue"
        >
          <Suspense fallback={<ProfolioLoader />}>
            {/* Global lights */}
            <ambientLight intensity={2.2} />
            <directionalLight
              position={[-3, 30, -10]}
              intensity={9}
              scale={[1, 1, 3]}
              castShadow
              shadow-mapSize-width={1024  * 8}
              shadow-mapSize-height={1024  * 8}
              shadow-camera-left={-200}
              shadow-camera-right={200}
              shadow-camera-top={200}
              shadow-camera-bottom={-200}
            />
                  {/* <directionalLight
              position={[11, 2, 10]}
              intensity={2}
              scale={[1, 1, 1]}
              castShadow
              shadow-mapSize-width={1024 * 4}
              shadow-mapSize-height={1024 * 4}
              shadow-camera-left={-200}
              shadow-camera-right={200}
              shadow-camera-top={200}
              shadow-camera-bottom={-200}
            /> */}



            <Physics iterations={10} gravity={[0, -9.8, 0]}>
              {/* <Debug> */}
<CameraController
  shorten={shorten}
  headRef={headRef}
  tubeActive={state?.marioMode}
  lockCamera={state?.lockCameraOnHead}
/>
              {state?.marioMode ? (
                <MarioScene headRef={headRef} />
              ) : (
                <MainScene headRef={headRef} onMarioEnter={() => setMarioIn()} onHeadHover={() => {}} />
              )}
              {/* </Debug> */}
            </Physics>
          </Suspense>
        </Canvas>
      </div>
      <div className={`glass-blur ${!state.loading && !state.gameStarted ? "started" : ""}`}></div>
      
    </>
  );
};

export default Scene;
