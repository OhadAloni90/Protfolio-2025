import React, { useEffect, useState } from "react";
import { useDarkMode } from "../../providers/DarkModeProvider/DarkModeProvider";
import "./About.scss";

interface AboutProps {
  isHovered: boolean;
}

const About = ({ isHovered }: AboutProps) => {
  const { state } = useDarkMode();
  const fullText = "Hi, I am Ohad, a Frontend Developer and Architect.";
  const [displayText, setDisplayText] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const typeLetter = () => {
      if (index < fullText.length) {
        setDisplayText((prev) => [...prev, fullText[index]]);
        setIndex((prev) => prev + 1);
        animationFrameId = requestAnimationFrame(typeLetter);
      }
    };

    animationFrameId = requestAnimationFrame(typeLetter); // Start animation

    return () => cancelAnimationFrame(animationFrameId); // Cleanup
  }, [index]);

  return (
    <div className={`main-container ${state.darkMode ? "dark" : "light"}`}>
      <div className={`container ${state.darkMode ? "" : "light"}`}>
        <div className="text text_bold text_extra_big typing-text">
          {displayText.map((letter, i) => (
            <span key={i} className="wave-letter" style={{ animationDelay: `${i * 0.05}s` }}>
              {letter === " " ? "\u00A0" : letter} {/* Fix spaces */}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
