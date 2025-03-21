import { Html, useProgress } from "@react-three/drei";
import React from "react";
import "./Loader.scss"; // Import the SCSS styles

const ProfolioLoader = () => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="loading-screen">
        {/* This element uses the SCSS animation */}
        <div className="loader"></div>
        {/* <h1 className="text text_bold text_title_big">Loading...</h1> */}
        <div>
          <h1>{Math.floor(progress)}%</h1>
        </div>
      </div>
    </Html>
  );
};

export default ProfolioLoader;
