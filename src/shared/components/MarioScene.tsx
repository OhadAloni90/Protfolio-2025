import React, { useEffect, useState } from "react";
import { OrthographicCamera, useFBX } from "@react-three/drei";
import { Debug, usePlane } from "@react-three/cannon";
import * as THREE from "three";
import HeadController from "../3d/HeadController";
import PhysicsCartoonHead from "../3d/Physics/PhysicsCartoonHead";
import MarioBrick from "../components/MarioBrick/MarioBrick";
import BackgroundMusic from "./BackgroundMusic/BackgroundMusic";
import Goomba from "./Goomba/Goomba";
import Shroom from "./Shroom/Shroom";

const Ground = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2.5, 0],
  }));
  return (
    <mesh ref={ref} receiveShadow castShadow>
      <boxGeometry args={[1000, 10, 0.5]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
};

type MarioSceneProps = {
  headRef: React.MutableRefObject<THREE.Group | null>;
};

const POOL_SIZE = 10;
export const levelMatrix: string[][] = [
  [".", ".", ".", ".", ".", "C"], // top row: 3 empties, 1 breakable, 1 item
  [".", ".", ".", ".", ".", "C"], // top row: 3 empties, 1 breakable, 1 item
  [".", ".", ".", "C", "C", "C"], // next row: 2 empties, 2 concrete, 1 item
  [".", ".", "C", "C", "C", "C"],
  [".", "C", "C", "C", "C", "C"], // row with all concrete except last is item
];
export const ItemBricksRow: string[][] = [
  [".", ".", ".", ".", ".", "."], // top row: 3 empties, 1 breakable, 1 item
  [".", ".", ".", ".", ".", "."], // top row: 3 empties, 1 breakable, 1 item
  [".", ".", ".", "B", "C", "I"], // next row: 2 empties, 2 concrete, 1 item
  [".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", "."], // row with all concrete except last is item
];

const MarioScene: React.FC<MarioSceneProps> = ({ headRef }) => {
  function createLevel(
    matrix: string[][],
    onItemSpawn: (pos: THREE.Vector3) => void,
    onPush: (impulse: THREE.Vector3) => void
  ) {
    const bricks: any[] = [];

    // Decide your top-left corner and cell sizes
    const startX = -2;
    const startY = 2;
    const cellWidth = 1;
    const cellHeight = 1;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        const cell = matrix[r][c];
        if (cell === ".") continue; // skip empty

        // Convert row/col to world coordinates
        const x = startX + c * cellWidth;
        const y = startY - r * cellHeight;

        // Decide brick props
        let breakable = false;
        let spawnsItem = false;
        let spawnType: "none" | "item" = "none";

        if (cell === "B") {
          breakable = true; // Breakable
        } else if (cell === "C") {
          breakable = false; // Concrete
        } else if (cell === "I") {
          spawnsItem = true; // Item
          spawnType = "item";
          breakable = false; // Concrete
        }

        bricks.push(
          <MarioBrick
            key={`r${r}-c${c}`}
            position={[x, y, 0]}
            breakable={breakable}
            spawnsItem={spawnsItem}
            spawnType={spawnType}
            onItemSpawn={onItemSpawn}
            onPush={onPush}
          />
        );
      }
    }
    return bricks;
  }

  // Preload the shroom model once.
  const shroomModel = useFBX("/models/mario-mini/mario_shroom.fbx") as THREE.Group;
  const [isOnBrick, setIsOnBrick]= useState(false);
  // Create a pool of shroom instances.
  const [pool, setPool] = useState<Array<{ id: number; active: boolean; pos: THREE.Vector3 }>>(
    Array.from({ length: POOL_SIZE }, (_, i) => ({
      id: i,
      active: false,
      pos: new THREE.Vector3(0, -1000, 0), // Initially offscreen.
    }))
  );

  // When a brick is hit, activate one shroom from the pool.
  const handleItemSpawn = (brickPos: THREE.Vector3) => {
    setPool((prev) => {
      const inactive = prev.find((s) => !s.active);
      console.log("inactive", inactive);
      if (!inactive) {
        console.warn("No more shrooms in the pool!");
        return prev;
      }
      inactive.active = true;
      // Adjust the offset so the shroom appears just above the brick.
      inactive.pos = brickPos.clone().add(new THREE.Vector3(0, 1, 0));
      return [...prev];
    });
  };

  // When a shroom is collected, mark it inactive.
  const handleShroomCollected = (id: number) => {
    setPool((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: false, pos: new THREE.Vector3(0, -1000, 0) } : s))
    );
    if (headRef.current) headRef.current.scale.set(1.4, 1.4, 1.4);
    if (headRef.current)
      headRef.current.position.set(headRef.current.position.x, headRef.current.position.y, headRef.current.position.z);
  };

  const rejectByForce = (impulse: any) => {
    const currentPos = headRef!.current!.position.clone();
    const floorY = -1;
    const bounceTarget = new THREE.Vector3(currentPos.x, floorY, currentPos.z);
    headRef?.current?.position.set(bounceTarget.x, bounceTarget.y, bounceTarget.z);
  };

  const onHeadCollide = (e: any) => {
    // Check if the collision is with a brick.
    if (e.body.userData?.type === "marioBrick") {
      // Here we assume that the brick’s position is the center of the brick
      // and that the brick is 1 unit high.
      // So the top of the brick is at brickPos.y + 0.5.
      setIsOnBrick(true);
      }
    }

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 10, 10]} zoom={55} />
      <BackgroundMusic path={"music/SuperMarioBros.mp3"} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[0, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Ground />

      <PhysicsCartoonHead
        ref={headRef}
        shorten={false}
        onHoverChange={() => {}}
        targetPosition={null}
        onCollide={onHeadCollide}
        position={[-7, -1, 0]}
        disableDrift={true}
      />

      <HeadController headRef={headRef} speed={0.1} isOnBrick={isOnBrick} />

      {/* Render all shroom pool items */}
      {pool.map((shroom) => (
        <Shroom
          key={shroom.id}
          id={shroom.id}
          active={shroom.active}
          position={[shroom.pos.x, shroom.pos.y, shroom.pos.z]}
          model={shroomModel}
          onCollected={handleShroomCollected}
        />
      ))}

      <Debug>
        {createLevel(levelMatrix, handleItemSpawn, rejectByForce)}
        {createLevel(ItemBricksRow, handleItemSpawn, rejectByForce)}

        {/* <MarioBrick
          position={[4, -1.8, 0]}
          breakable={false}
          spawnsItem={false}
          onItemSpawn={handleItemSpawn}
          onPush={(impulse: any) => rejectByForce(impulse)}
        />
             <MarioBrick
          position={[5, -1.8, 0]}
          breakable={false}
          spawnsItem={false}
          onItemSpawn={handleItemSpawn}
          onPush={(impulse: any) => rejectByForce(impulse)}
        />
               <MarioBrick
          position={[5, -0.8, 0]}
          breakable={false}
          spawnsItem={false}
          onItemSpawn={handleItemSpawn}
          onPush={(impulse: any) => rejectByForce(impulse)}
        />
                     <MarioBrick
          position={[6, -1.8, 0]}
          breakable={false}
          spawnsItem={false}
          onItemSpawn={handleItemSpawn}
          onPush={(impulse: any) => rejectByForce(impulse)}
        />
                       <MarioBrick
          position={[6, -0.8, 0]}
          breakable={false}
          spawnsItem={false}
          onItemSpawn={handleItemSpawn}
          onPush={(impulse: any) => rejectByForce(impulse)}
        />

        <MarioBrick
          position={[-3, 1, 0]}
          breakable={false}
          spawnsItem={true}
          spawnType="item"
          onItemSpawn={handleItemSpawn}
          onPush={(impulse: any) => rejectByForce(impulse)}
        />
        <MarioBrick
          position={[-4, 1, 0]}
          breakable={false}
          spawnsItem={false}
          onPush={(impulse: any) => rejectByForce(impulse)}
        />
        
        <MarioBrick
          position={[-10, 1, 0]}
          breakable={false}
          spawnsItem={false}
          onPush={(impulse: any) => rejectByForce(impulse)}
        />
        <MarioBrick
          position={[-5, 1, 0]}
          breakable={true}
          spawnsItem={false}
          onPush={(impulse: any) => rejectByForce(impulse)}
        /> */}
        <Goomba headRef={headRef} />
      </Debug>
    </>
  );
};

export default MarioScene;
