import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Route, HashRouter as Router, Routes, useNavigate } from "react-router";
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
    navigate(`/${route.toLowerCase()}`);
    if (state?.marioMode) dispatch({ type: "SET_MARIO_MODE" });
    else dispatch({ type: "SET_GAME_STARTED" });
  };

  useEffect(() => {}, [state]);
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
