import React from "react";
import { MeshReflectorMaterial, GradientTexture } from "@react-three/drei";
import { DoubleSide, Vector3 } from "three";
import { usePlane } from "@react-three/cannon";
import { useDarkMode } from "../../providers/DarkModeProvider/DarkModeProvider";

interface FloorWithGridProps {
  onFloorClick: (pos: Vector3) => void;
}

const FloorWithGrid: React.FC<FloorWithGridProps> = ({ onFloorClick }) => {
  const { state } = useDarkMode();

  // Static physics plane (collision group 1 colliding with head group 3)
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0],
    collisionFilterGroup: 1,
    collisionFilterMask: 3,
  }));

  return (
    <mesh
      ref={ref}
      receiveShadow
      castShadow
      scale={[200, 200, 1]}
      onClick={(e) => {
        e.stopPropagation();
        const adjustedPoint = e.point.clone();
        adjustedPoint.y += 1;
        onFloorClick(adjustedPoint);
      }}
    >
      <planeGeometry args={[1, 1]} />
      <MeshReflectorMaterial
        blur={[300, 30]}
        mirror={0.01}
        mixBlur={0.1}
        mixStrength={0.098}
        resolution={3072}
        side={DoubleSide}
      >
        <GradientTexture
          attach="map"
          size={4}
          stops={[0.05, 0.25, 0.5]}
          colors={
            !state?.darkMode
              ? ["#fff", "#b3cde0", "#011f4b"]
              : ["#1A1A1D", "#6A1E55", "#000"]
          }
        />
      </MeshReflectorMaterial>
    </mesh>
  );
};

export default FloorWithGrid;
