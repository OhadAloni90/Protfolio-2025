import React, { useState } from "react";
import * as THREE from "three";
import { useLocation } from "react-router";
import PhysicsCartoonHead, { PhysicsCartoonHeadHandle } from "../Physics/PhysicsCartoonHead";
import HeadController from "../Controllers/HeadController";
import PushButton from "../../components/3DButton/PushButton";
import Mouth from "../../components/Mouth/Mouth";
import WoodenArrow from "../../components/WoodenArrow/WoodenArrow";
import Experience from "../../pages/Experience/Experience";
import Skills from "../../pages/Skills/Skills";
import FloorWithGrid from "../../components/FloorWithGrid/FloorWithGrid";
import MarioTube from "../../components/MarioTube/MarioTube";
import BioTemplate from "../../pages/Bio/BioTemplate";
import BoundaryWall from "../../components/BoundryWall/BoundryWall";
import LimitReached from "../../components/LimitReached/LimitReached";
import Social3DModel from "../../components/Social3DModel/Social3DModel";
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";
import KeyboardExplaining from "../../components/KeyboardExplaining/KeyboardExplaining";
import { Autofocus, EffectComposer } from "@react-three/postprocessing";
import { Html, Sky, SpotLight } from "@react-three/drei";
import BackgroundMusic from "../../components/BackgroundMusic/BackgroundMusic";

interface MainSceneProps {
  onMarioEnter: () => void;
  onHeadHover: (hovering: boolean) => void;
  headRef: React.MutableRefObject<PhysicsCartoonHeadHandle | null>;
}
interface SocialMediaModel {
  modelUrl: string; // URL or path to your GLB or FBX model.
  textureUrl: string;
  linkUrl: string;
  modelType: "fbx" | "glb";
  position: [number, number, number];
  rotation: [number, number, number];
  mass: number;
  scale: number; // Scale the model uniformly.
}

const MainScene: React.FC<MainSceneProps> = ({ onMarioEnter, onHeadHover, headRef }) => {
  const location = useLocation();
  const { state } = useGlobal();
  const socialMediaModels: SocialMediaModel[] = [
    {
      modelUrl: `${process.env.PUBLIC_URL}/models/social/facebook.FBX`, // URL or path to your GLB or FBX model.
      modelType: "fbx", // 'glb' or 'fbx'
      position: [29, 2, 7], // Set model position in the scene.
      mass: 10,
      rotation: [0, Math.PI / 3, 0], // Rotate the model (in radians).
      scale: 0.008, // Scale the model uniformly.
      textureUrl: `${process.env.PUBLIC_URL}/models/social/facebook.jpg`, // Optional texture URL.
      linkUrl: "https://www.facebook.com/AloniOhad/",
    },
    {
      modelUrl: `${process.env.PUBLIC_URL}/models/social/linkedin.fbx`, // URL or path to your GLB or FBX model.
      modelType: "fbx", // 'glb' or 'fbx'
      position: [31, 1, -7], // Set model position in the scene.
      mass: 10,
      rotation: [0, -Math.PI / 2, 0], // Rotate the model (in radians).
      scale: 0.065, // Scale the model uniformly.
      textureUrl: "", // Optional texture URL.
      linkUrl: "https://www.linkedin.com/in/ohad-aloni-a23630175/",
    },
    {
      modelUrl: `${process.env.PUBLIC_URL}/models/social/github.glb`, // URL or path to your GLB or FBX model.
      modelType: "glb", // 'glb' or 'fbx'
      position: [29, 0, -16], // Set model position in the scene.
      mass: 10,
      rotation: [0, -Math.PI / 4, 0], // Rotate the model (in radians).
      scale: 0.7, // Scale the model uniformly.
      textureUrl: `${process.env.PUBLIC_URL}/models/social/github.jpeg`, // Optional texture URL.
      linkUrl: "https://github.com/OhadAloni90",
    },
  ];
  const shorten = location.pathname !== "/";
  const [headTargetPosition, setHeadTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [scrollHovered, setScrollHovered] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [warningPosition, setWarningPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [showLimitReached, setShowLimitReached] = useState(false);
  const handleScrollClick = (scrollPos: THREE.Vector3) => {
    if (!scrollHovered) setHeadTargetPosition(scrollPos);
  };

  // Collision logic for the head
  const handleHeadCollide = (e: any) => {
    const type: string = e.body.userData?.type;
    if (type === "tube") {
      onMarioEnter();
    } else if (type === "pushButton") {
      setDialogOpen(!dialogOpen);
      // Handle button collision, etc.
    } else if (type === "vertical" || type === "wreckingBall") {
      if (headRef && headRef.current) {
        const currentPos = headRef.current.position.clone();
        const floorY = -1;
        const bounceTarget = new THREE.Vector3(
          currentPos.x,
          floorY,
          currentPos.z - (type === "wreckingBall" ? 2 : 0.1)
        );
        setHeadTargetPosition(bounceTarget);
      }
    } else if (type === "boundryWall" && !showLimitReached) {
      // Try to extract the collision contact point from the event.
      if (e.contact && headRef.current) {
        // e.contact.ri is the contact point relative to the head's center.
        const localContact = new THREE.Vector3(e.contact.ri.x, e.contact.ri.y, e.contact.ri.z);
        // Compute the world position by adding the head's position.
        const worldContact = headRef.current.position.clone().add(localContact);
        setWarningPosition(
          new THREE.Vector3(e.contact.contactPoint[0] - 1, e.contact.contactPoint[1], e.contact.contactPoint[2])
        );
      } else {
        // Fallback: if contact info isn't available, use the wall's position
        setWarningPosition(e.body.position.clone());
      }
      showBoundryWarning();
    }
  };
  const showBoundryWarning = () => {
    const currentPos = headRef!.current!.position.clone();
    setShowLimitReached(true);
    setTimeout(() => {
      setShowLimitReached(false);
    }, 1500);
  };
  const socialMedia = () => {
    return (
      socialMediaModels &&
      socialMediaModels.map((social: SocialMediaModel) => (
        <Social3DModel
          modelUrl={social.modelUrl} // URL or path to your GLB or FBX model.
          modelType={social.modelType}
          textureUrl={social.textureUrl}
          position={social.position} // Set model position in the scene.
          mass={social.mass}
          rotation={social.rotation} // Rotate the model (in radians).
          scale={social.scale} // Scale the model uniformly.
          linkUrl={social.linkUrl}
        />
      ))
    );
  };
  const woodenArrows = () => (
    <>
      <WoodenArrow
        key={"skills"}
        text="Skills"
        position={[-8, 0, 2]}
        rotation={[0, Math.PI - 0.2, 0]}
        scale={[2, 4, 6]}
        flipText={false}
      />
      <WoodenArrow
        key={"experience"}
        text="Experience"
        position={[1, 0, -5]}
        rotation={[0, Math.PI / 9 + 0.7, 0]}
        scale={[2, 4, 6]}
        flipText={true}
      />
      <WoodenArrow
        key={"social"}
        text="Social"
        position={[14, 0, 2]}
        rotation={[0, Math.PI / 7, 0]}
        scale={[2, 4, 6]}
        flipText={true}
      />
    </>
  );

  return (
    <>
      <group>
        {state?.gameStarted && <BackgroundMusic path={`${process.env.PUBLIC_URL}/music/main_scene_sound.mp3`} />}
        <FloorWithGrid onFloorClick={handleScrollClick} />
      </group>
      {/* <EffectComposer enableNormalPass={false}>
      <Autofocus />
        </EffectComposer>; */}

        <MarioTube position={[11, 0, 10]} onEnter={onMarioEnter} />

      <PhysicsCartoonHead
        ref={headRef}
        onHoverChange={onHeadHover}
        onCollide={handleHeadCollide}
        position={[0, 0, 0]}
      />
      <Sky distance={450000} sunPosition={[0, 5, -100]} inclination={0} azimuth={0.2} />

      {/**
       * Top and bottom
       *  */}
      <BoundaryWall position={[0, 0, 20]} scale={[10000, 15, 2]} transparent />
      <BoundaryWall position={[0, 0, -70]} scale={[10000, 15, 2]} transparent />
      {/**
       * left and right
       *  */}
      <BoundaryWall position={[50, 0, 0]} scale={[15, 2, 1000]} propRotation={[0, 0, Math.PI / 2]} transparent />
      <BoundaryWall position={[-90, 0, 0]} scale={[15, 2, 1000]} propRotation={[0, 0, Math.PI / 2]} transparent />

      {showLimitReached && headRef.current && (
        <LimitReached rotation={[0, 0, 0]} position={[warningPosition.x, warningPosition.y, warningPosition.z]} />
      )}
      <HeadController headRef={headRef} speed={0.1} />
      <Mouth position={[0, -1.5, 8]} scale={[0.02, 0.02, 0.02]} rotation={[Math.PI / 10, Math.PI, 0]} />
      {state?.darkMode ? (
        <PushButton
          text="Bio - Jump to activate!"
          position={[-8, -1.8, -4]}
          rotation={[0, 0, 2 * Math.PI]}
          scale={[20, 20, 20]}
          dialogOpen={dialogOpen}
          onCloseDialog={() => {
            setDialogOpen(false);
          }}
          dialogContent={<BioTemplate darkMode={true} />}
          dialog={{ width: "40rem", height: "40rem" }}
        />
      ) : (
        <PushButton
          text="Bio - Jump to activate"
          position={[-8, -1.8, -4]}
          rotation={[0, 0, 2 * Math.PI]}
          scale={[20, 20, 20]}
          dialogOpen={dialogOpen}
          onCloseDialog={() => {
            setDialogOpen(false);
          }}
          dialogContent={<BioTemplate darkMode={false} />}
          dialog={{ width: "40rem", height: "35rem" }}
        />
      )}
            <fog attach="fog" args={[state?.darkMode ? '#0000000' : '#  ', 50, 60]} />

      {woodenArrows()}
      {socialMedia()}
      <Skills headRef={headRef} position-z={-0.1} />
      <Experience headRef={headRef} shorten={shorten} />
    </>
  );
};
export default MainScene;
