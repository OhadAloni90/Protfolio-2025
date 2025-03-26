import React, { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text, useVideoTexture, } from "@react-three/drei";
import * as THREE from "three";
import "./InteractiveSurfaceDisplay.scss";
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";

export interface InteractiveSurfaceDisplayProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  text?: string;
  subtext?: string;
  videoSrc?: string;
  shorten?: boolean;
}

// Custom hook that always calls useVideoTexture.
function useMaybeVideoTexture(src: string | undefined, options: any) {
  // Always call useVideoTexture (with an empty string if src is undefined)
  const texture = useVideoTexture(src || "", options);
  return src ? texture : null;
}

const InteractiveSurfaceDisplay: React.FC<InteractiveSurfaceDisplayProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width,
  height,
  text,
  subtext,
  videoSrc,
  shorten,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { state } = useGlobal();
  const [isPlaying, setIsPlaying] = useState(false);

  // Use our custom hook so that useVideoTexture is always called.
  const videoTexture = useMaybeVideoTexture(videoSrc, {
    crossOrigin: "Anonymous",
    loop: true,
    muted: true,
    start: false,
  });

  // Set up event listeners when a video texture is available.
  useEffect(() => {
    if (videoTexture && videoTexture.image) {
      const vid = videoTexture.image as HTMLVideoElement;
      const handlePlaying = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      vid.addEventListener("playing", handlePlaying);
      vid.addEventListener("pause", handlePause);
        // Make sure wrapping is enabled
        videoTexture.wrapS = THREE.RepeatWrapping
        // Set the pivot to the center
        videoTexture.center.set(0.5, 0.5)
        // Flip horizontally
        videoTexture.repeat.x = -1
          return () => {
        vid.removeEventListener("playing", handlePlaying);
        vid.removeEventListener("pause", handlePause);
      };
    }
  }, [videoTexture]);

  // Fallback: Create a canvas texture when no videoSrc is provided.
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 10;
    c.height = 10;
    return c;
  }, []);
  const context = useMemo(() => canvas.getContext("2d"), [canvas]);
  const canvasTexture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas]);

  // Update the canvas each frame.
  useFrame(() => {
    if (!videoSrc && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#222";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = "48px sans-serif";
      context.fillStyle = "#fff";
      if (text) {
        context.fillText(text, 50, 100);
      }
      canvasTexture.needsUpdate = true;
    }
  });

  // Choose which texture to use.
  const usedTexture = videoTexture || canvasTexture;

  // Toggle play/pause for the video.
  const togglePlayPause = async () => {
    if (!videoTexture || !videoTexture.image) return;
    const vid = videoTexture.image as HTMLVideoElement;
    if (vid.paused) {
      try {
        await vid.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing video:", error);
      }
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={usedTexture}

        toneMapped={false} 
        side={THREE.DoubleSide}
      />

      {text && (
        <Text
          position={[0, 19, 0]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.6}
          color={!state?.darkMode ? "#000" : "#fff"}
          anchorX="center"
          anchorY="top"
          font={`${process.env.PUBLIC_URL}/fonts/SpaceMono-Bold.ttf`}
        >
          {text}
        </Text>
      )}
      {subtext && (
        <Text
          strokeOpacity={shorten ? 1 : 0}
          outlineOpacity={shorten ? 1 : 0}
          fillOpacity={shorten ? 1 : 0}
          position={[0, 13, 0]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.5}
          color={!state?.darkMode ? "#000" : "#fff"}
          anchorX="center"
          anchorY="middle"
          maxWidth={17}
          fontStyle="normal"
          font={`${process.env.PUBLIC_URL}/fonts/SpaceMono-Regular.ttf`}
        >
          {subtext}
        </Text>
      )}

      {videoSrc && (
        <Html receiveShadow position={[0, -10, 0]} center style={{ pointerEvents: "auto", opacity: shorten ? 1 : 0 }}>
          <div className={`botón ${isPlaying ? "active" : ""}`} onClick={togglePlayPause}>
            <div className="fondo"></div>
            <div className="icono">
              <div className="parte izquierda"></div>
              <div className="parte derecha"></div>
            </div>
            <div className="puntero"></div>
          </div>
        </Html>
      )}
    </mesh>
  );
};

export default InteractiveSurfaceDisplay;
