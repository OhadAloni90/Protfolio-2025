import React, { useState, useMemo, useRef, useEffect } from "react";
import { useBox } from "@react-three/cannon";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

export interface MarioBrickProps {
  position?: [number, number, number];
  breakable?: boolean;          // Brick will break on collision from below.
  spawnsItem?: boolean;         // Brick will spawn an item when hit.
  spawnType?: "none" | "item" | "powerUp" | "walk";
  // The second parameter is required: either "shroom" or "fireflower"
  onItemSpawn?: (pos: THREE.Vector3, itemType: "shroom" | "fireflower") => void;
  onPush?: (impulse: THREE.Vector3) => void;  // Callback to push the head.
  isEnlarge?: boolean; // Tells the brick if the player is already powered up.
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
  isEnlarge = false,
}) => {
  const [broken, setBroken] = useState(false);
  const [debris, setDebris] = useState<
    Array<{ id: number; pos: [number, number, number] }>
  >([]);
  // State to track if this brick has already been used (changed to concrete).
  const [isConcrete, setIsConcrete] = useState(false);
  // Use a ref to block multiple triggers in rapid succession.
  const hasSpawnedRef = useRef(false);
  // Use a ref to always have the current value of isEnlarge.
  const isEnlargeRef = useRef(isEnlarge);
  useEffect(() => {
    isEnlargeRef.current = isEnlarge;
  }, [isEnlarge]);

  const [ref, api] = useBox(() => ({
    type: "Static",
    args: [1, 1, 4],
    position,
    friction: 1,
    restitution: 0,
    mass: 10000,
    collisionFilterGroup: 2,
    collisionFilterMask: 3,
    userData: { type: "marioBrick" },
    onCollide: (e) => {
      if (e.body.userData?.type !== "head") return;
      console.log(e.contact.ni)
      if (e.contact && e.contact.ni && e.contact.ni[1] < 0.5) return;
      // For breakable bricks, break them.
      if (breakable) {
        handleHit();
      } else if (spawnsItem) {
        // Only spawn the item once.
        if (!hasSpawnedRef.current) {
          hasSpawnedRef.current = true;
          setIsConcrete(true); // Update state so texture updates.
          // Disable further collisions so this brick won't trigger again.
          api.collisionFilterMask.set(0);
          if (onItemSpawn) {
            // Read the current isEnlarge value from the ref.
            const spawnItemType = isEnlargeRef.current ? "fireflower" : "shroom";
            setTimeout(() => {
              const spawnPos = new THREE.Vector3(
                position[0],
                position[1],
                position[2]
              );
              onItemSpawn(spawnPos, spawnItemType);
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
        if (!hasSpawnedRef.current) {
          hasSpawnedRef.current = true;
          setIsConcrete(true);
        }
      }
    },
  }));

  // Load textures.
  const brickTexture = useLoader(
    THREE.TextureLoader,
    `${process.env.PUBLIC_URL}/textures/mini-game/mario_brick.jpg`
  );
  const concreteTexture = useLoader(
    THREE.TextureLoader,
    `${process.env.PUBLIC_URL}/textures/mini-game/mario_concrete.jpg`
  );
  const itemTexture = useLoader(
    THREE.TextureLoader,
    `${process.env.PUBLIC_URL}/textures/mini-game/mario_item.jpg`
  );

  // Determine which texture to use based on type and whether it's been used.
  const textureToUse = useMemo(() => {
    if (spawnType === "walk") return brickTexture;
    if (spawnsItem) return isConcrete ? concreteTexture : itemTexture;
    return isConcrete ? concreteTexture : brickTexture;
  }, [spawnType, spawnsItem, isConcrete, brickTexture, concreteTexture, itemTexture]);

  const handleHit = () => {
    if (broken) return;
    setBroken(true);
    // Disable further collisions.
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
        ],
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
