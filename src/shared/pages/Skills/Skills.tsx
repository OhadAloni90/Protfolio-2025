import "./Skills.scss";
import React from "react";
import { Physics } from "@react-three/cannon";
import * as THREE from "three";
import InteractiveSurface from "../../components/InteractiveSurface/InterActiveSurface";
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";

interface SkillsProps {
  headRef: React.RefObject<THREE.Group | null>;
}

const Skills = ({ headRef }: SkillsProps) => {
  const handleWallCollide = (e: any) => {

    // Add additional collision handling if needed.
  };
  const handleScrollClick = () => {

  }
  const { state  }   = useGlobal();
  return (
    <>
                {/* InteractiveSurface for the "My Skills" board */}
                <InteractiveSurface
                
        boardProps={{
          width: 8,
          height: 8,
          color: !state?.darkMode ?  "pink" : '#A64D79',
          position: [-26, 0, 3],
       colliderThickness: 0.3,
          rotation: [0, Math.PI / 10, 0],
          children: (
            <>
              <h1 className="text text_bold text_title_big">My Skills</h1>
              <p className="text text_med">This is what I can do</p>
            </>
          ),
        }}
        wreckingBallProps={{
          pivotPosition: [-26, 6,-2],
          ballPosition: [-26, 4, -2],
          ropeLength: 5,
          radius: 1,
          mass: 10,
          color: "darkgray",
          onWallCollide: handleWallCollide,
        }}
        buttonProps={{
          headRef,
          position: [-26, -2, 1],
          rotation: [Math.PI / 2, Math.PI, Math.PI / 11],
          color: !state?.darkMode ?  "orange" : '#241b20',
          text:  "HULK SMASH A",
          threshold: 7,
        }}
      />

      {/* InteractiveSurface for the "Frontend stack" board */}
      <InteractiveSurface
        boardProps={{
          width: 8,
          height: 8,
          color: !state?.darkMode ?  "pink" : '#A64D79',
          position: [-40, 1, 5],
       colliderThickness: 0.3,
          rotation: [0, -Math.PI / 9, -Math.PI / 12],
          children: (
            <>
              <div className="board-header">
                <h1 className="text text_bold text_title_big">Frontend stack</h1>
              </div>
              <div className="board-body">
                <p className="text text_med">Angular - V12 - V16 - Typescript</p>
                <p className="text text_med">React - Typescript</p>
                <p className="text text_med">ThreeJS & React Three Fiber & Drei</p>
                <p className="text text_med">CannonJS</p>
                <p className="text text_med">CSS + HTML - RJX</p>
              </div>
            </>
          ),
        }}
        wreckingBallProps={{
          // Adjust these positions as needed so the wrecking ball is close to the board.
          pivotPosition: [-40, 6, -1],
          ballPosition: [-40, 4, -1],
          ropeLength: 6,
          radius: 1,
          mass: 10,
          color: "darkgray",
          onWallCollide: handleWallCollide,
        }}
        buttonProps={{
          headRef,
          position: [-40, -2, 1],
          rotation: [Math.PI / 2, Math.PI,- Math.PI / 8],
          color: !state?.darkMode ?  "orange" : '#241b20',
          text: "HULK SMASH B",
          threshold: 7,
        }}
      />

      {/* InteractiveSurface for the "More programming stack" board */}
      <InteractiveSurface
        boardProps={{
          width: 8,
          height: 8,
          color: !state?.darkMode ?  "pink" : '#A64D79',
          position: [-55, 0, 5],
       colliderThickness: 0.3,
          rotation: [0, Math.PI / 8, 0],
          children: (
            <>
              <div className="board-header">
                <h1 className="text text_bold text_title_med">More programming stack</h1>
              </div>
              <div className="board-body">
                <p className="text text_med">Python</p>
                <p className="text text_med">C</p>
                <p className="text text_med">SQL</p>
                <p className="text text_med">ExpressJS</p>
              </div>
            </>
          ),
        }}
        wreckingBallProps={{
          pivotPosition: [-55, 6, -2],
          ballPosition: [-55, 2, -2],
          ropeLength: 6,
          radius: 1,
          mass: 10,
          color: "darkgray",
          onWallCollide: handleWallCollide,
        }}
        buttonProps={{
          headRef,
          position: [-55, -2, 1],
          rotation: [Math.PI / 2, Math.PI, Math.PI / 8],
          color: !state?.darkMode ?  "orange" : '#241b20',
          text: "HULK SMASH C",
          threshold: 7,
        }}
      />

      {/* InteractiveSurface for the "Softwares & more stuff I know" board */}
      <InteractiveSurface
        boardProps={{
          width: 8,
          height: 8,
          color: !state?.darkMode ?  "pink" : '#A64D79',
          position: [-65, 0, 5],
       colliderThickness: 0.3,
          rotation: [0, -Math.PI / 6, 0],
          children: (
            <>
              <div className="board-header">
                <h1 className="text text_bold text_title_med">Softwares & more stuff I know</h1>
              </div>
              <div className="board-body">
                <p className="text text_med">Photoshop</p>
                <p className="text text_med">InDesign</p>
                <p className="text text_med">ArchiCAD</p>
                <p className="text text_med">AutoCAD</p>
                <p className="text text_med">Revit</p>
                <p className="text text_med">Rhinoceros</p>
                <p className="text text_med">Grasshopper</p>
                <p className="text text_med">Office suite</p>
              </div>
            </>
          ),
        }}
        wreckingBallProps={{
          pivotPosition: [-65, 6, 0],
          ballPosition: [-65, 4, 0],
          ropeLength: 6,
          radius: 1,
          mass: 10,
          color: "darkgray",
          onWallCollide: handleWallCollide,
        }}
        buttonProps={{
          headRef,
          position: [-65, -2, 2],
          rotation: [Math.PI / 2, Math.PI, -Math.PI / 6],
          color: !state?.darkMode ?  "orange" : '#241b20',
          text: "HULK SMASH D",
          threshold: 7,
        }}
      />

    </>
  );
};

export default Skills;
