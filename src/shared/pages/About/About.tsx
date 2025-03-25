import React, { useEffect, useState } from "react";
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";
import "./About.scss";

interface AboutProps {
  isHovered: boolean;
}

const About = ({ isHovered }: AboutProps) => {
  const { state } = useGlobal();
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
    <>

    </>
  );
};

export default About;
