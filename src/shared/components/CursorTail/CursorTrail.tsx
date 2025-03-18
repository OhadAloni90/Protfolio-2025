import React, { useEffect, useState } from "react";

const CursorTrail = () => {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      // Define offsets for a 3x3 matrix around the cursor.
      const offsets = [
        [-20, -20],
        [0, -20],
        [20, -20],
        [-20, 0],
        [0, 0],
        [20, 0],
        [-20, 20],
        [0, 20],
        [20, 20],
      ];
      const timestamp = Date.now();
      // Create a dot for each offset
      const newDots = offsets.map(([ox, oy]) => ({
        x: e.clientX + ox,
        y: e.clientY + oy,
        id: timestamp + "_" + ox + "_" + oy,
        created: timestamp,
      }));
      setDots((prev: any) => prev && [...prev, ...newDots]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Remove dots older than 1 second for a trailing fade effect.
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        const cutoff = Date.now() - 500;
        return prev.filter((dot: any) => dot.created > cutoff);
      });
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {dots?.map((dot: any) => (
        <div
          key={dot?.id}
          style={{
            position: "fixed",
            left: dot.x,
            top: dot.y,
            width: 3,
            height: 3,
            background: "white",
            borderRadius: "50%",
            pointerEvents: "none",
            opacity: 0.8,
            transform: "translate(-50%, -50%)",
            transition: "opacity 0.1s ease-out",
          }}
        />
      ))}
    </>
  );
};


export default CursorTrail;
