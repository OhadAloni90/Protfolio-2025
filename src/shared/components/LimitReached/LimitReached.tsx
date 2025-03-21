import { Html } from '@react-three/drei';
import React from 'react'
interface LimitReachedProps {
    position: [number,number,number];
    rotation: [number, number, number];
}
const LimitReached: React.FC<LimitReachedProps> = ({position = [0,0,0], rotation = [0,0,0]}) => {
  return (
     <>
                  <Html position={position} rotation={rotation}>
            <div className="text text_bold text_big limit_reached">Limit Reached!</div>
            <div className="stop-sign-wrapper">
              <div className="text">STOP</div>
              <div className="hexagon"></div>
              <div className="hexagon2"></div>
            </div>
          </Html>
          {/* <Html position={[77, 4, 0]}>
            <div className="text text_bold text_big limit_reached">Limit Reached!</div>
            <div className="stop-sign-wrapper">
              <div className="text">STOP</div>
              <div className="hexagon"></div>
              <div className="hexagon2"></div>
            </div>
          </Html> */}

        </>          
  )
}

export default LimitReached