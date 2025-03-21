import React, { useEffect } from "react";

interface BackgroundMusicProps  {
    path: string;
}
const BackgroundMusic: React.FC<BackgroundMusicProps>= ({path}) => {
  useEffect(() => {
    const audio = new Audio(path);
    audio.loop = true;
    // Depending on browser policies, you might need a user gesture to play sound.
    audio.play().catch((err) => {
      console.error("Failed to play background music:", err);
    });
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);
  return null;
};

export default BackgroundMusic;
