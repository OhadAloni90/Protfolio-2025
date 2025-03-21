import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import './InteractiveSurfaceDisplay.scss'
import { useGlobal } from '../../providers/DarkModeProvider/DarkModeProvider';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const { state } = useGlobal();
  // Create video element if videoSrc is provided.
  const video = useMemo(() => {
    if (videoSrc) {
      const vid = document.createElement('video');
      vid.src = videoSrc;
      vid.crossOrigin = 'Anonymous';
      vid.loop = true;
      vid.muted = true;
      vid.width = 320;
      vid.height = 240;
      // Set autoplay properties instead of calling play() immediately.
      vid.autoplay = true;
      vid.playsInline = true;
      // Listen for events to update our state.
      vid.addEventListener('playing', () => {
        setIsPlaying(true);
      });
      vid.addEventListener('pause', () => {
        setIsPlaying(false);
      });
      return vid;
    }
    return null;
  }, [videoSrc]);

  const videoTexture = useMemo(() => (video ? new THREE.VideoTexture(video) : null), [video]);

  // Create and setup the canvas (for when no videoSrc is provided)
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 10;
    c.height = 10;
    return c;
  }, []);
  const context = useMemo(() => canvas.getContext('2d'), [canvas]);
  const canvasTexture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas]);

  // Update the canvas each frame (if no video is used)
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

  // Choose which texture to use: videoTexture if available; otherwise, canvasTexture.
  const usedTexture = videoTexture || canvasTexture;

  // Toggle play/pause for the video
  const togglePlayPause = async () => {
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing video:", error);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={usedTexture} side={THREE.DoubleSide} />
      
      {text && (
        <Text
          position={[0, 6, 0.1]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.9}
          color={!state?.darkMode ? '#000': '#fff'}
          anchorX="center"
          anchorY="middle"
          font="fonts/AmaticSC-Bold.ttf"
        >
          {text}
        </Text>
      )}
      {subtext && (
        <Text
          strokeOpacity={shorten ? 1 : 0}
          outlineOpacity={shorten ? 1 : 0}
          fillOpacity={shorten ? 1 : 0}
          position={[0, 0, 0.1]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.7}
          color={!state?.darkMode ? '#000': '#fff'}
          anchorX="center"
          anchorY="middle"
          maxWidth={10}
          fontStyle="normal"
          font="fonts/AmaticSC-Regular.ttf"
        >
          {subtext}
        </Text>
      )}
      
      {videoSrc && (
        <Html
          receiveShadow
          position={[0, -height / 2 - 1,50]}
          center
          style={{ pointerEvents: 'auto', opacity: shorten ? 1 : 0 }}
        >
          {/* Outer container toggles the "active" class based on isPlaying */}
          <div
            className={`botón ${isPlaying ? "active" : ""}`}
            onClick={togglePlayPause}
          >
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
