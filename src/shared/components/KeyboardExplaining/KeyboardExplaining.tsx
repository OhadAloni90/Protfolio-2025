import React from "react";
import KeyboardHtml from "./KeyboardHtml";
import { Html } from "@react-three/drei";
import './KeyboardExplaining.scss';
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";
const KeyboardExplaining = () => {
    const { state, dispatch } = useGlobal();

  return (
    <>
    <div className={`instruction ${state?.darkMode ? 'dark':'light'}`} >
        <div className={`instruction-header ${state?.darkMode ? 'dark':'light'}`}>
          <div className="title text">
            <p className="text_title_big"> This is how you play & move</p>
            <p className="text text_med"> Hover the highlighted Key to see action</p>
          </div>
        </div>
        <div className={`instruction-body ${state?.darkMode ? 'dark':'light'}`}>
            <KeyboardHtml/>
        </div>
        <div className={`instruction-footer ${state?.darkMode ? 'dark':'light'}`}>
            <button className={`button ${state?.darkMode ? 'dark':'light'}`} onClick={() => dispatch({type: 'INSTRUCTION_APPROVED'})}>Close</button>
        </div>
      </div>
    </>
  );
};

export default KeyboardExplaining;
