import React from 'react'
import './Home.scss';
import Scene from '../3d/Scene';
import Header from '../components/Header/Header';
import CursorTrail from '../components/CursorTail/CursorTrail';
import { useDarkMode } from '../providers/DarkModeProvider/DarkModeProvider';
const Home = () => {
    const { state } = useDarkMode(); // Get darkMode state

  return (
    <div className={`main-container ${state.darkMode ? 'dark' : 'light'}`}>
        <div className={`container ${state.darkMode ? '' : 'light'}`}>
        </div>
      
        {/* <CursorTrail/> */}
    </div>
  )
}

export default Home