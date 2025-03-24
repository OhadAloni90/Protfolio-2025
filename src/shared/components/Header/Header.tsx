import React, { useEffect, useState } from "react";
import "./Header.scss";
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";

const titles: string[] = ["start", "CV"];
interface HeaderInterface {
  onMenuItemClicked: (route: string) => void;
}

const Header = ({ onMenuItemClicked }: HeaderInterface) => {
  const { state, dispatch } = useGlobal();
  const [didClickStart, setDidClickStart] = useState(false);

  const onMenuItemClick = (title: string) => {
    setDidClickStart(!didClickStart);
      onMenuItemClicked(title);
  }
 const titleToShow = (title: string) => {
  if(state?.gameStarted && !state?.marioMode) {
    return title === 'start' ? 'back' : title
  } else if (state?.gameStarted && state?.marioMode && title !== 'CV') return 'reset';
  return title;
 }
  return (
    <div className={`header-container ${state.darkMode ? "dark" : "light"}`}>
      <div className="menu-items">
        {titles.map((title: string) => (
          <div
            key={title}
            className={`text text_big btn ${state.darkMode ? "dark" : "light"} ${state?.loading ? 'disabled' : ''}`}
            onClick={() =>  onMenuItemClick(didClickStart && title === 'start' ? 'back' : title)}
          >
            {titleToShow(title)}
          </div>
        
        ))}
      </div>
      <div className="toggle-container">
        <div className="mute-button">
          <button className="btn" onClick={() => dispatch({type: 'PLAY_MUSIC'})}>
            <img src={state?.playMusic ? `${process.env.PUBLIC_URL}/images/icons/volume-up.svg` : `${process.env.PUBLIC_URL}/images/icons/volume-mute.svg`} />
          </button>
        </div>
        {/* Add a dynamic class based on dark mode */}
        <label className={`switch ${state.darkMode ? "checked" : ""}`}>
          <input
            className="cb"
            type="checkbox"
            checked={state.darkMode}
            onChange={() => dispatch({ type: "TOGGLE_DARK_MODE" })}
          />
          <span className="toggle">
            <span className="left">off</span>
            <span className="right">on</span>
          </span>
        </label>
      </div>
    </div>
  );
};

export default Header;
