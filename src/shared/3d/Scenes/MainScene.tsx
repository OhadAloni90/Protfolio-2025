import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useLocation } from "react-router";
import { Selection } from "@react-three/postprocessing";
import { useProgress } from "@react-three/drei";
import PhysicsCartoonHead from "../Physics/PhysicsCartoonHead";
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
export const bioDialogContent = (
    <>
      <div className="dialog-header wave-letter">
        <div className="text text_title_big text_bold My Bio">Ohad Aloni</div>
        <div className="text text_title_med">Architect and Front-end developer.</div>
      </div>
      <div className="dialog-body wave-letter">
        <div className="">
          Holds a vast experience in design, fine arts, data analysis and programming. A firm believer in exploring and
          combining a wide array of practises, specifically within the intersection technology and art.
          <br />
          <br />
          First ventured into the world of programming while working as a BI Developer, soon after graduating from
          Thelma Yellin High School of the Arts. During that time, he also produced electronic music, organized events, and
          regularly performed under the stage name of Tomba. Ensuing his growing success and relocation to Europe, Tom has
          appeared on hundreds of stages all over the world, while garnering millions of views and collaborating with
          prominent names in the electronic music industry. Soon after his return to Israel, Tom began his architecture
          studies where he was first introduced to parametric design. His rich background in creative software and coding
          has enabled him to quickly master generative design tools, and tutor students from various disciplines during
          and after his studies.
        </div>
        <div className="self-drawing">
          <img src="/self-drawing.jpg" alt="Self drawing" />
        </div>
      </div>
    </>
  );
  
  interface MainSceneProps {
    onMarioEnter: () => void;
    onHeadHover: (hovering: boolean) => void;
    headRef: React.MutableRefObject<THREE.Group | null>;
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
        if (headRef.current) {
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
          position={[2, 0, -3]}
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
          <Selection>
            <ScrollModel onScrollClick={handleScrollClick} onHoverChange={setScrollHovered} />
          </Selection>
        </group>
        <MarioTube position={[5, 0, 0]} onEnter={onMarioEnter} />

        <PhysicsCartoonHead
          ref={headRef}
          shorten={shorten}
          onHoverChange={onHeadHover}
          targetPosition={headTargetPosition}
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
          dialogContent={bioDialogContent}
          dialog={{ width: "40rem", height: "40rem" }}
        />
        {shorten && woodenArrows()}
        <Skills headRef={headRef} position-z={-0.1} />
        <Experience headRef={headRef} shorten={shorten} />
      </>
    );
  };
  export default MainScene;
