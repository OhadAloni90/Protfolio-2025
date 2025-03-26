import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.scss";
import { Navigate, Route, HashRouter as Router, Routes, useNavigate } from "react-router";
import Home from "./shared/pages/Home";
import { GlobalProvider, useGlobal } from "./shared/providers/DarkModeProvider/DarkModeProvider";
import About from "./shared/pages/About/About";
import Header from "./shared/components/Header/Header";
import Scene from "./shared/3d/Scene";
import KeyboardExplaining from "./shared/components/KeyboardExplaining/KeyboardExplaining";
import useIsMobile from "./shared/hooks/UseIsMobile";
import { ExpereinceItem, exprienceTypes } from "./shared/pages/Experience/Experience";
// Create a component that uses useNavigate inside Router context.
const AppRoutes = () => {
  const { dispatch, state } = useGlobal();
  const navigate = useNavigate();
  const expTypes = exprienceTypes;
  const skillsArray: string[] = [
    "Python",
    "C",
    "RStudio",
    "Jupyter Notebook ",
    "HTML",
    "CSS",
    "SCSS",
    "Javascript + Typescript",
    "Angular",
    "React",
    "SQL(MySQL,SQLserver)",
    "ExpressJS",
    "ThreeJS",
    "CannonJS",
    "RxJS",
  ];
  const stackArray: string[] = [
    "Asynchronous programming",
    "Git",
    "Node.js",
    "ES6",
    "Distributed SaaS systems",
    "API development",
    "Front-end",
    "Performance optimization",
    "Cross-browser compatibility",
    "Cccessibility programming",
    "Expertise in design and aesthetics",
  ];
  const isMobile = useIsMobile();
  const [isHeadHovered, setIsHeadHovered] = useState(false); // Track hover state
  const onMenuItemClicked = (route: string) => {
    if (route === "back" && !state?.marioMode) route = "";
    if (route === "about") route = "";
    navigate(`/${route.toLowerCase()}`);
    // When going back from Mario mode, lock the camera to the head.
    if (state?.marioMode && route === "start") {
      dispatch({ type: "LOCK_CAMERA_ON_HEAD" });
    } else if (state?.marioMode && route === "back") {
      dispatch({ type: "SET_MARIO_MODE" });
      dispatch({ type: "SET_GAME_STARTED" });
    } else if (state?.marioMode) {
      dispatch({ type: "SET_MARIO_MODE" });
    } else {
      dispatch({ type: "SET_GAME_STARTED" });
    }
  };
  const downloadCV = () => {
    const pdfUrl = `${process.env.PUBLIC_URL}/OhadAloni-CV-2025.pdf`;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.setAttribute("download", "CV.pdf"); // Sets the suggested filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const DownloadIcon = () => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={downloadCV}>
        <path
          d="M11 5C11 4.44772 11.4477 4 12 4C12.5523 4 13 4.44772 13 5V12.1578L16.2428 8.91501L17.657 10.3292L12.0001 15.9861L6.34326 10.3292L7.75748 8.91501L11 12.1575V5Z"
          fill="currentColor"
        />
        <path
          d="M4 14H6V18H18V14H20V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V14Z"
          fill="currentColor"
        />
      </svg>
    );
  };
  const CVDialog = () => {
    return (
      <>
        <div className={`cv-container ${state?.darkMode ? 'dark' : 'light'}`}>
          <div className={`top-container ${state?.darkMode ? 'dark' : 'light'}`}>
            <div className="title text text_title_big text_bold">Ohad Aloni - Software Developer</div>
            <DownloadIcon />
          </div>
          <div className="center-container">
            <div className="prefix text text_big">
              <div className="left-container text">
                I am a multidisciplinary developer and designer with a background in architecture, UX, and computer
                science. With a deep passion for user-focused design and seamless UI/UX, I blend aesthetic precision
                with technical expertise to create engaging digital experiences. My architectural training enhances my
                structured thinking, allowing me to collaborate effectively with product teams and ensure thoughtful,
                user-centric solutions.
              </div>
              <div className="right-container">
                <div className="photo-container">
                  <img src={`${process.env.PUBLIC_URL}/images/OhadAloniComingSoon.png`} />
                </div>
              </div>
            </div>
            <div className="partion">
              <div className="left-container">
                <div className="experience ">
                  <div className="title text_title_med text_bold">Expereince</div>
                  {expTypes?.map((type: ExpereinceItem) => (
                    <>
                      <div className="item">
                        <div className="date-container">
                          <div className="text-item">{type.name}</div>
                          <div className="text-item">{type.job_title}</div>
                          <div className="text-item">{type.period}</div>
                        </div>
                        <div className="desc-container">{type?.description}</div>
                      </div>
                    </>
                  ))}
                </div>
                <div className="education">
                  <div className="item">
                    <div className="text_bold">
                      Tel-Aviv University, B.SC in Digital Science (Applied computer science) for High- Tech
                      (Accelerated framework)
                    </div>
                    <div className="text-item">OCTOBER - 2020 - JULY- 2022</div>
                    <div className="text-item">
                      The program included courses in mathematics, programming, hardware, machine learning, data
                      statistics, data structures, algorithms, operating systems, computer vision, and databases,
                      offered by the Faculty of Engineering.
                    </div>
                  </div>
                  <div className="item">
                    <div className="text_bold">Tel-Aviv University, B. Arch (Architecture)</div>
                    <div className="">October 2013 - July 2018</div>
                  </div>
                  <div className="item">
                    <div className="text_bold">University of Haifa, UX Designer Certificate</div>
                    <div className="text-item">November 2019- April 2020</div>
                  </div>
                </div>
              </div>
              <div className={`right-container ${state?.darkMode ? 'dark' : 'light'} `}>
                <div className="chip-container Skills text_bold">
                  <div className="text text_big ">Skills</div>
                  {skillsArray.map((skill: string) => (
                    <div className={`tag ${state?.darkMode ? 'dark' : 'light'}`}>{skill}</div>
                  ))}
                </div>
                <div className="chip-container Stack">
                  <div className="text text_big text_bold">Stack</div>
                  {stackArray.map((skill: string) => (
                    <div className={`tag ${state?.darkMode ? 'dark' : 'light'}`}>{skill}</div>
                  ))}
                </div>
                <div className="chip-container Stack">
                  <div className="text text_big text_bold">Languages</div>
                  {["Hebrew", "English"].map((language: string) => (
                    <div className={`tag ${state?.darkMode ? 'dark' : 'light'}`}>{language}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bottom-container">
            <button className="button" onClick={() => dispatch({type: 'ON_SHOW_CV'})}>Close</button>
          </div>
        </div>
      </>
    );
  };
  if (isMobile) {
    return (
      <div className="mobile-warning">
        <div className="text-container">
          <h1 className="text text_title_big mobile_title_big">Mobile coming soon!</h1>
          <p className="text text_title_big">Enjoy it on desktop meanwhile.</p>
        </div>
        <img src={`${process.env.PUBLIC_URL}/images/OhadAloniComingSoon.png`} />
      </div>
    );
  }
  return (
    <>
      {state?.showCv && <CVDialog />}
      <div className="header">{<Header onMenuItemClicked={onMenuItemClicked} />}</div>
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
