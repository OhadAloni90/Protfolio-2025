import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Route, BrowserRouter as Router, Routes, useNavigate } from "react-router";
import Home from "./shared/pages/Home";
import { DarkModeProvider } from "./shared/providers/DarkModeProvider/DarkModeProvider";
import About from "./shared/pages/About/About";
import Header from "./shared/components/Header/Header";
import Scene from "./shared/3d/Scene";

// Create a component that uses useNavigate inside Router context.
const AppRoutes = () => {
  const navigate = useNavigate();
  const [isHeadHovered, setIsHeadHovered] = useState(false); // Track hover state
  const onMenuItemClicked = (route: string) => {
    navigate(`/${route.toLowerCase()}`);
  };

  return (
    <>
      <div className="header">
        <Header onMenuItemClicked={onMenuItemClicked} />
      </div>
      <div className="scene">
        <Scene onHeadHover={setIsHeadHovered}></Scene>
      </div>
      <Routes>
  <Route path={`${process.env.PUBLIC_URL}/`} element={<Home />} />
  <Route path={`${process.env.PUBLIC_URL}/start`} element={<About isHovered={isHeadHovered} />} />
</Routes>

    </>
  );
};

function App() {
  const PortalRoot =  () => <div id="portal-root" />;
  return (
    <DarkModeProvider>
      <Router>
        <PortalRoot/>
        <AppRoutes />
      </Router>
    </DarkModeProvider>
  );
}

export default App;
