import React, { useState, useRef, useEffect } from "react";
import { Html, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import "./ScrollMode.scss";

interface ScrollModelProps {
  onHoverChange: (hovering: boolean) => void;
  onScrollClick: (position: THREE.Vector3) => void;
}

interface EducationTitle {
  ins_name: string;
  degree_name: string;
  duration: { start_mon: string; end_mon: string };
  description: string;
}

const ScrollModel: React.FC<ScrollModelProps> = ({ onHoverChange, onScrollClick }) => {
  const educationTitles: EducationTitle[] = [
    {
      ins_name: "Tel Aviv Uiversity",
      degree_name: "B.Sc in Digital Sciences for High Tech - Applied computer science",
      duration: { start_mon: "Oct - 2020", end_mon: "Oct - 2022" },
      description: "sad",
    },
    {
      ins_name: "Tel Aviv Uiversity",
      degree_name: "B.Architecture",
      duration: { start_mon: "Oct - 2013", end_mon: "Oct - 2017" },
      description: "sad",
    },
    {
      ins_name: "University of Haifa",
      degree_name: "UX Designer Certification",
      duration: { start_mon: "Oct - 2020", end_mon: "Feb - 2021" },
      description: "sad",
    },
  ];

  // Load both the closed and opened scroll models.
  const closedScroll = useGLTF("/models/scroll.glb");
  const openScroll = useGLTF("/models/opened_scroll.glb");

  const groupRef = useRef<THREE.Group>(null);

  // Whether we’ve switched to the open scroll model
  const [isOpen, setIsOpen] = useState(false);
  // Whether the spin animation is currently running
  const [isSpinning, setIsSpinning] = useState(false);
  // Whether we're closing (i.e. animating backwards)
  const [isClosing, setIsClosing] = useState(false);
  // 0→1 progress of the spin animation
  const [spinProgress, setSpinProgress] = useState(0);
  // Duration (in seconds) for the spin animation
  const spinDuration = 1.5;

  // We can get the camera if we want to do dynamic "lookAt" or positioning
  const { camera } = useThree();

  // Ensure that all children cast and receive shadows.
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, []);

  // Animate when spinning (opening or closing).
  useFrame((_, delta) => {
    if (!groupRef.current || !isSpinning) return;
    let newProgress: number;
    if (isClosing) {
      newProgress = Math.max(spinProgress - delta / spinDuration, 0);
    } else {
      newProgress = Math.min(spinProgress + delta / spinDuration, 1);
    }
    setSpinProgress(newProgress);

    // 1) ROTATION
    const initialRot = new THREE.Euler(0, -Math.PI / 2, 0);
    const finalRot = new THREE.Euler(0, (3 * Math.PI) / 2, 0);
    const rotX = THREE.MathUtils.lerp(initialRot.x, finalRot.x, newProgress);
    const rotY = THREE.MathUtils.lerp(initialRot.y, finalRot.y, newProgress);
    const rotZ = THREE.MathUtils.lerp(initialRot.z, finalRot.z, newProgress);
    groupRef.current.rotation.set(rotX , rotY, rotZ);

    // 2) POSITION
    const initialPos = new THREE.Vector3(8, -1, 1);
    const finalPos = new THREE.Vector3(-6, 0, -1);
    const currentPos = new THREE.Vector3().lerpVectors(initialPos, finalPos, newProgress);
    groupRef.current.position.copy(currentPos);

    // 3) SCALE
    const initialScale = new THREE.Vector3(1, 1, 1);
    const finalScale = new THREE.Vector3(4, 5, 5);
    const currentScale = new THREE.Vector3().lerpVectors(initialScale, finalScale, newProgress);
    groupRef.current.scale.copy(currentScale);

    // 4) Check if animation is done
    if (!isClosing && newProgress === 1) {
      // Finished opening
      setIsSpinning(false);
      setIsOpen(true);
      groupRef.current.rotation.set(rotX - 2 , rotY, rotZ);
    }
    if (isClosing && newProgress === 0) {
      // Finished closing
      setIsSpinning(false);
      setIsOpen(false);
      setIsClosing(false);
    }
  });

  // Start the spin animation for opening.
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (!isOpen && !isSpinning) {
      setIsSpinning(true);
      setIsClosing(false);
      setSpinProgress(0);
      const worldPos = new THREE.Vector3();
      groupRef.current?.getWorldPosition(worldPos);
      onScrollClick(worldPos);
    }
  };

  // Container for each education title.
  const EducationTitleContainer = (eTitle: EducationTitle) => {
    return (
      <div className="eTitle container text" key={eTitle.degree_name}>
        <div className="ins-title">
          <div className="deg_name text_title">{eTitle.degree_name}</div>
          <div className="int_name text_bold">{eTitle.ins_name}</div>
          <div className="duration">
            {eTitle.duration.start_mon + " - " + eTitle.duration.end_mon}
          </div>
        </div>
      </div>
    );
  };

  return (
    <group
      ref={groupRef}
      rotation={[0, -Math.PI / 2, 0]}
      position={[8, -1.5, -1]}
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHoverChange(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHoverChange(false);
      }}
    >
      {(!isOpen || isClosing) ? (
        // Render the closed scroll model during closing or when not open.
        <primitive object={closedScroll.scene} />
      ) : (
        // Render the open scroll model with the HTML overlay when fully open.
        <primitive object={openScroll.scene}>
          <Html
            className="embedded"
            center={false}
            style={{ transformOrigin: "top right" }}
          >
            <div className="wave-letter text-container" style={{ width: 300, padding: "1rem 0" }}>
              <div className="top-container">
                <div className="text text_title_big">Hello Minions!</div>
                <div
                  className="close"
                  onClick={() => {
                    // Reset the spin progress to fully open before starting closing
                    setSpinProgress(1);
                    setIsClosing(true);
                    setIsSpinning(true);
                                  }}
                >
                  X
                </div>
              </div>
              <p className="text_title_med">This is my Education.</p>
              <div className="middle-container">
                {educationTitles.map((educationTitle: EducationTitle) =>
                  EducationTitleContainer(educationTitle)
                )}
              </div>
            </div>
          </Html>
        </primitive>
      )}
    </group>
  );
};

export default ScrollModel;
