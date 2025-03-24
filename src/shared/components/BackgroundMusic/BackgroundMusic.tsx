import React, { useEffect, useRef } from "react";
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";

interface BackgroundMusicProps {
  path: string;
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ path }) => {
  const { state } = useGlobal();
  // Create and store the audio instance so it persists across renders.
  const audioRef = useRef<HTMLAudioElement>(new Audio(path));

  // Update the audio source if the 'path' prop changes.
  useEffect(() => {
    if (audioRef.current.src !== path) {
      audioRef.current.src = path;
    }
  }, [path]);

  // Listen to changes in the global playMusic state.
  useEffect(() => {
    // Always set loop to true.
    audioRef.current.loop = true;

    if (state?.playMusic) {
      // When music should play, resume playback.
      audioRef.current
        .play()
        .catch((err) => console.error("Failed to play background music:", err));
        audioRef.current.volume = 0.4;
    } else {
      // When music should pause, simply pause the current audio instance.
      audioRef.current.pause();
    }
  }, [state?.playMusic]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  return null;
};

export default BackgroundMusic;
