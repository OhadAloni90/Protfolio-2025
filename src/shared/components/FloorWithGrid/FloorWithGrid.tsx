import React from "react";
import { MeshReflectorMaterial, GradientTexture } from "@react-three/drei";
import { DoubleSide, Vector3 } from "three";
import { useDarkMode } from "../../providers/DarkModeProvider/DarkModeProvider";

interface FloorWithGridProps {
  onFloorClick: (pos: Vector3) => void;
}

const FloorWithGrid: React.FC<FloorWithGridProps> = ({ onFloorClick }) => {
  const { state } = useDarkMode();

  return (
    <mesh
      receiveShadow
      position={[0, -2, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[200, 200, 1]}
      onClick={(e) => {
        e.stopPropagation();
        const adjustedPoint = e.point.clone();
        adjustedPoint.y += 1;
        onFloorClick(adjustedPoint);
      }}
    >
      <planeGeometry />
      <MeshReflectorMaterial
        blur={[300, 30]}     // Adjusts the blur of the reflection [width, height]
        mirror={0.01}          // Reflectivity (0 = no reflection, 1 = full mirror)
        mixBlur={0.1}         // Blends the blur with the reflection
        mixStrength={0.098}     // Overall intensity of the reflection
        resolution={1024 * 3}     // Texture resolution for the reflection
        side={DoubleSide}     // Ensures the material is visible from both sides
      >
        <GradientTexture
          attach="map"
          size={4}
          stops={[0.05, 0.25, 0.5]} // Gradient stops
          colors={ !state?.darkMode ? ["#fff", "#b3cde0", "#011f4b"] :  ["#1A1A1D", "#6A1E55", "#000"] } // Colors for the gradient
        />
      </MeshReflectorMaterial>
    </mesh>
  );
};

export default FloorWithGrid;
