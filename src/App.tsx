import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Navigate, Route, HashRouter as Router, Routes, useNavigate } from "react-router";
import Home from "./shared/pages/Home";
import { GlobalProvider, useGlobal } from "./shared/providers/DarkModeProvider/DarkModeProvider";
import About from "./shared/pages/About/About";
import Header from "./shared/components/Header/Header";
import Scene from "./shared/3d/Scene";
import KeyboardExplaining from "./shared/components/KeyboardExplaining/KeyboardExplaining";

// Create a component that uses useNavigate inside Router context.
const AppRoutes = () => {
  const { dispatch, state } = useGlobal();
  const navigate = useNavigate();
  const [isHeadHovered, setIsHeadHovered] = useState(false); // Track hover state
  const onMenuItemClicked = (route: string) => {
    if(route === 'back' && !state?.marioMode) route = '';
    if(route === 'about') route = '';
    navigate(`/${route.toLowerCase()}`);
    // When going back from Mario mode, lock the camera to the head.
    if (state?.marioMode && route === "start") {
      dispatch({ type: "LOCK_CAMERA_ON_HEAD" });
    } else if(state?.marioMode && route === "back"){
      dispatch({ type: "SET_MARIO_MODE" });
      dispatch({ type: "SET_GAME_STARTED" });

    } else if (state?.marioMode) {
      dispatch({ type: "SET_MARIO_MODE" });
    } else {
      dispatch({ type: "SET_GAME_STARTED" });
    }
  };

  useEffect(() => {

    // In your app entry point (e.g., index.tsx)

  }, [state]);
  return (
    <>
      <div className="header">
        {<Header onMenuItemClicked={onMenuItemClicked} />}
      </div>
      <div className="scene">
        <Scene onHeadHover={setIsHeadHovered}></Scene>
      </div>
      <div className="instructions">{state?.gameStarted && !state?.instructionApproved && <KeyboardExplaining />}</div>
      <Routes>
        <Route path={`/`} element={<Home />} />
        <Route path={`/back`} element={<Home />} />

        <Route path={`/start`} element={<About isHovered={isHeadHovered} />} />

      </Routes>
    </>
  );
};

function App() {
  const PortalRoot = () => <div id="portal-root" />;
  return (
    <GlobalProvider>
      <Router>
        <PortalRoot />
        <AppRoutes />
      </Router>
    </GlobalProvider>
  );
}

export default App;
