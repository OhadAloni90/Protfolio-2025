import React, { useRef, useState } from "react";
import * as THREE from "three";
import VerticalSurface, { VerticalSurfaceProps } from "../../components/VerticalSurface/VerticalSurface";
import InteractiveHtmlButton, { InteractiveHtmlButtonProps } from "../../components/InteractiveHtmlButton/InteractiveHtmlButton";
import WreckingBall, { WreckingBallProps, WreckingBallRef } from "../../components/WreckingBall/WreckingBall";

interface InteractiveSurfaceProps {
  boardProps: VerticalSurfaceProps;
  wreckingBallProps: WreckingBallProps;
  buttonProps: InteractiveHtmlButtonProps;
}

const InteractiveSurface = ({
  boardProps,
  wreckingBallProps,
  buttonProps,
}: InteractiveSurfaceProps) => {
  const wreckingBallRef = useRef<WreckingBallRef>(null);
  const [resetCounter, setResetCounter] = useState(0);
  const [isResetMode, setIsResetMode] = useState(false);

  const triggerSmash = () => {
    if (wreckingBallRef.current && wreckingBallRef.current.api) {
      const impulse = new THREE.Vector3(0, -5, -15);
      wreckingBallRef.current.api.applyImpulse(impulse.toArray(), [0, 0, 0]);
    }
  };

  const reset = () => {
    setResetCounter((prev) => prev + 1);
    if (wreckingBallRef.current && wreckingBallProps.ballPosition) {
      wreckingBallRef.current.api.position.set(...wreckingBallProps.ballPosition);
      wreckingBallRef.current.api.velocity.set(0, 0, 0);
      wreckingBallRef.current.api.angularVelocity.set(0, 0, 0);
    }
    setIsResetMode(false);
  };

  // Inject the onExplode callback so that when the wall explodes, we enter reset mode.
  const boardPropsWithExplode: VerticalSurfaceProps = {
    ...boardProps,
    onExplode: () => {
      setIsResetMode(true)
    },
  };

  return (
    <group key={resetCounter}>
      <VerticalSurface {...boardPropsWithExplode} />
      <WreckingBall {...wreckingBallProps} ref={wreckingBallRef} />
      {
        isResetMode ?       <InteractiveHtmlButton
        {...buttonProps}
        text={"Reset" }
        onClick={() => {
            reset();
         
        }} />
 :       <InteractiveHtmlButton
 {...buttonProps}
 text={ buttonProps.text}
 onClick={() => {
     triggerSmash();
 }}
 />
}
      <InteractiveHtmlButton
        {...buttonProps}
        text={isResetMode ? "Reset" : buttonProps.text}
        onClick={() => {
          if (isResetMode) {
            reset();
          } else {
            triggerSmash();
          }
        }}
      />
    </group>
  );
};

export default InteractiveSurface;
