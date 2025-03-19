import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useLocation } from "react-router";
import { Selection } from "@react-three/postprocessing";
import { useProgress } from "@react-three/drei";
import PhysicsCartoonHead, { PhysicsCartoonHeadHandle } from "../Physics/PhysicsCartoonHead";
import ProfolioLoader from "../../pages/Loader/Loader";
import HeadController from "../HeadController";
import PushButton from "../../components/3DButton/PushButton";
import Mouth from "../../components/Mouth/Mouth";
import WoodenArrow from "../../components/WoodenArrow/WoodenArrow";
import Experience from "../../pages/Experience/Experience";
import Skills from "../../pages/Skills/Skills";
import ScrollModel from "../../components/ScrollModel/ScrollModel";
import FloorWithGrid from "../../components/FloorWithGrid/FloorWithGrid";
import MarioTube from "../../components/MarioTube/MarioTube";
import BioTemplate from "../../pages/Bio/BioTemplate";
  
  interface MainSceneProps {
    onMarioEnter: () => void;
    onHeadHover: (hovering: boolean) => void;
    headRef: React.MutableRefObject<PhysicsCartoonHeadHandle | null>;
  }
  
  const MainScene: React.FC<MainSceneProps> = ({ onMarioEnter, onHeadHover, headRef }) => {
    const location = useLocation();
    const shorten = location.pathname !== "/";
    const [headTargetPosition, setHeadTargetPosition] = useState<THREE.Vector3 | null>(null);
    const [scrollHovered, setScrollHovered] = useState(false);
    const [dialogOpen, setDialogOpen]= useState(false);
    const handleScrollClick = (scrollPos: THREE.Vector3) => {
      if (!scrollHovered) setHeadTargetPosition(scrollPos);
    };
  
    // Collision logic for the head
    const handleHeadCollide = (e: any) => {
      if (e.body.userData?.type === "tube") {
        onMarioEnter();
      } else if (e.body.userData?.type === "pushButton") {
        setDialogOpen(!dialogOpen);
        // Handle button collision, etc.
      } else if (e.body.userData?.type === "vertical" || e.body.userData?.type === "wreckingBall") {
        if (headRef && headRef.current) {
          const currentPos = headRef.current.position.clone();
          const floorY = -1;
          const bounceTarget = new THREE.Vector3(
            currentPos.x,
            floorY,
            currentPos.z - (e.body.userData?.type === "wreckingBall" ? 2 : 0.1)
          );
          setHeadTargetPosition(bounceTarget);
        }
      }
    };
  
    const { progress } = useProgress();
    const CustomLoader = () => <ProfolioLoader />;
  
    const woodenArrows = () => (
      <>
        <WoodenArrow
        key={'skills'}
          text="Skills"
          position={[-8, 0, 2]}
          rotation={[0, Math.PI - 0.2, 0]}
          scale={[2, 4, 6]}
          flipText={false}
        />
        <WoodenArrow
                key={'experience'}
          text="Experience"
          position={[1, 0, -5]}
          rotation={[0, Math.PI / 9 + 0.7, 0]}
          scale={[2, 4, 6]}
          flipText={true}
        />
        <WoodenArrow
                        key={'social'}
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
          <FloorWithGrid onFloorClick={handleScrollClick} />
        </group>
        <MarioTube position={[11, 0, 10]} onEnter={onMarioEnter} />
        <PhysicsCartoonHead

          ref={headRef}
          onHoverChange={onHeadHover}
          onCollide={handleHeadCollide}
          position={[0, 0, 0]}
        />
        <HeadController headRef={headRef} speed={0.1} />
        <Mouth
          position={[0, -1.5, 8]}
          scale={[0.02, 0.02, 0.02]}
          rotation={[Math.PI / 10, Math.PI, 0]}
        />
        <PushButton
          text="Bio"
          position={[-8, -1.8, -4]}
          rotation={[0, 0, 2 * Math.PI]}
          scale={[20, 20, 20]}
          dialogOpen={dialogOpen}
          onCloseDialog={() => {setDialogOpen(false)}}
          dialogContent={<BioTemplate/>}
          dialog={{ width: "40rem", height: "40rem" }}
        />
        { woodenArrows()}
        <Skills headRef={headRef} position-z={-0.1} />
        <Experience headRef={headRef} shorten={shorten} />
      </>
    );
  };
  export default MainScene;
