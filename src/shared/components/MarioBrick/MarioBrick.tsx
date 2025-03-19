import React, { useState, useMemo } from "react";
import { useBox } from "@react-three/cannon";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

export interface MarioBrickProps {
  position?: [number, number, number];
  breakable?: boolean;          // If true, the brick will break on collision from below.
  spawnsItem?: boolean;         // If true, the brick will spawn an item when hit.
  spawnType?: "none" | "item" | "powerUp" | "walk";
  onItemSpawn?: (pos: THREE.Vector3) => void; // Callback to spawn an item or power-up model.
  onPush?: (impulse: THREE.Vector3) => void;  // Callback to push the head.
}

function DebrisFragment({ position }: { position: [number, number, number] }) {
  const [ref] = useBox(() => ({
    mass: 0.1,
    position,
    velocity: [
      (Math.random() - 0.5) * 4,
      Math.random() * 3,
      (Math.random() - 0.5) * 4,
    ],
    userData: { type: "debris" },
  }));
  
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color="brown" />
    </mesh>
  );
}

const MarioBrick: React.FC<MarioBrickProps> = ({
  position = [0, 2, 0],
  breakable = false,
  spawnsItem = false,
  spawnType = "none",
  onItemSpawn,
  onPush,
}) => {
  const [broken, setBroken] = useState(false);
  const [debris, setDebris] = useState<Array<{ id: number; pos: [number, number, number] }>>([]);
  const [isConcrete, setIsConcrete] = useState(false);

  const [ref, api] = useBox(() => ({
    type: "Static",
    args: [1, 1, 4],
    position,
    friction: 1,
    restitution: 0,
    mass: 10000,
    // Set collision filtering: put brick in group 2, head is in group 3.
    collisionFilterGroup: 2,
    collisionFilterMask: 3,
    userData: { type: "marioBrick" },
    onCollide: (e) => {
      // Only react if the other body is the head.
      if (e.body.userData?.type !== "head") return;
      if (spawnType === "walk") return;             //  do nothing

      // Check collision contact normal.
      if (e.contact && typeof e.contact.ni[1] === "number") {
        // If the normal's y is greater than or equal to -0.5,
        // assume the head landed on top (or sideways) and do nothing.
        if (e.contact.ni[1] <= -0.9) {
          return;
        }
      }
 
      
      // If collision is from below, trigger the appropriate reaction.
      if (breakable) {
        handleHit();
      } else if (spawnsItem) {
        if (!isConcrete) {
          setIsConcrete(true);
          if (onItemSpawn) {
            setTimeout(() => {
              const spawnPos = new THREE.Vector3(position[0], position[1], position[2]);
              onItemSpawn(spawnPos);
            }, 0);
          }
          if (onPush) {
            const impulse = new THREE.Vector3(2, -5, 0);
            onPush(impulse);
          }
        }
      } else {
        if (onPush) {
          const impulse = new THREE.Vector3(2, -5, 0);
          onPush(impulse);
        }
        setIsConcrete(true);
      }
    },
  }));

  const brickTexture = useLoader(THREE.TextureLoader, "/textures/mini-game/mario_brick.jpg");
  const concreteTexture = useLoader(THREE.TextureLoader, "/textures/mini-game/mario_concrete.jpg");
  const itemTexture = useLoader(THREE.TextureLoader, "/textures/mini-game/mario_item.jpg");

  const textureToUse = useMemo(() => {
    if (spawnType === "walk") return brickTexture;
    if (spawnsItem) return isConcrete ? concreteTexture : itemTexture;
    return isConcrete ? concreteTexture : brickTexture;
  }, [spawnType, spawnsItem, isConcrete, brickTexture, concreteTexture, itemTexture]);
  
  const handleHit = () => {
    if (broken) return;
    setBroken(true);
    api.collisionFilterMask.set(0);
    spawnDebris();
  };

  const brickColor = () => {
    if (spawnsItem) {
      return broken ? "brown" : "yellow";
    }
    return "brown";
  };

  const spawnDebris = () => {
    const newDebris: Array<{ id: number; pos: [number, number, number] }> = [];
    const debrisCount = 10;
    for (let i = 0; i < debrisCount; i++) {
      newDebris.push({
        id: i,
        pos: [
          position[0] + (Math.random() - 0.5) * 0.5,
          position[1] + 0.5,
          position[2] + (Math.random() - 0.5) * 0.5,
        ] as [number, number, number],
      });
    }
    setDebris(newDebris);
  };

  if (broken) {
    return (
      <>
        {debris.map((d) => (
          <DebrisFragment key={d.id} position={d.pos} />
        ))}
      </>
    );
  }

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 4]} />
      <meshStandardMaterial map={textureToUse} color={brickColor()} />
    </mesh>
  );
};

export default MarioBrick;
