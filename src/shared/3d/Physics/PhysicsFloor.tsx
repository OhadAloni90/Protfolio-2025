// PhysicsFloor.tsx
import React from "react";
import { usePlane } from "@react-three/cannon";

const PhysicsFloor: React.FC = () => {
  const [ref] = usePlane(() => ({
    position: [0, -2, 0],
    rotation: [-Math.PI / 2, 0, 0],
    collisionFilterGroup: 2,  // use group 2 for the floor
    collisionFilterMask: 2,   // floor only collides with group 2 objects
    userData: { type: "floor" },
  }));
  return <mesh ref={ref} visible={false} />;
};

export default PhysicsFloor;
