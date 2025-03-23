import { Html, useProgress } from "@react-three/drei";
import React, { useEffect } from "react";
import "./Loader.scss"; // Import your SCSS styles
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";

const ProfolioLoader = () => {
  const { progress } = useProgress();
  const { dispatch } = useGlobal();
const one = 'Loading'
  // Define circle parameters.
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  // Calculate offset so that when progress=0 offset = circumference and when progress=100 offset=0.
  const offset = circumference * (1 - progress / 100);
  useEffect(() => {
    console.log('progress,',progress)
    if (progress >= 98) {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [progress, dispatch]);
  
  return (
    <Html center>
      <div className="loading-screen">
        <svg
          className="progress-svg"
          width="300"
          height="300"
          viewBox="0 0 120 120"
        >
          {/* Background circle */}
          <circle
            className="progress-bg"
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#ddd"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            className="progress-bar"
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#f00"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
          {/* Text in the center */}
          <text
            x="60"
            y="65"
            textAnchor="middle"
            fill="#333"
            fontSize="20"
          >
            {Math.floor(progress)}%
          </text>
          <div>

            {one.split('').map((letter: string) => (
              <span className="letter__panel"></span>
            ))}
          </div>
        </svg>
      </div>
    </Html>
  );
};

export default ProfolioLoader;
