export const playSound = (path: string, volume: number) => {
    const audio = new Audio(path);
    audio.loop = false;
    audio.play().catch((err) => {
      console.error("Failed to play sound:", err);
    });
    audio.volume = volume;
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  };
  