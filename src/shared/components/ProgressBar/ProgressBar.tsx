import React, { useState, useEffect } from "react";

interface ProgressBarWithImageProps {
  progress: number; // Target progress (0 to 100)
  imageSrc: string;
  duration?: number; // Animation duration in milliseconds (optional)
}

const ProgressBarWithImage: React.FC<ProgressBarWithImageProps> = ({ progress, imageSrc, duration = 2000 }) => {
  // Animate from 0 to the target progress over the given duration
  const [internalProgress, setInternalProgress] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const animate = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      // Calculate current progress (linearly scaled)
      const newProg = Math.min((progress * elapsed) / duration, progress);
      setInternalProgress(newProg);
      if (elapsed < duration) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [progress, duration]);

  // Determine the bar color based on internalProgress thresholds.
  let barColor = "red";
  if (internalProgress >= 50 && internalProgress < 70) {
    barColor = "orange";
  } else if (internalProgress >= 70 && internalProgress < 90) {
    barColor = "lightgreen";
  } else if (internalProgress >= 90) {
    barColor = "green";
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "20px",
        background: "#eee",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${internalProgress}%`,
          height: "100%",
          background: barColor,
          transition: "background 0.8s linear",
        }}
      />
      {/* Always display the image on the right side */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translate(50%, -50%)", // partially off the bar
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid white",
        }}
      >
        <img
          src={imageSrc}
          alt="Language"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>
  );
};

export default ProgressBarWithImage;
