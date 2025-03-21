import React, { useEffect, useState } from "react";
import { Html, Lightformer, OrthographicCamera, useFBX } from "@react-three/drei";
import { Debug, usePlane } from "@react-three/cannon";
import * as THREE from "three";
import HeadController from "../HeadController";
import PhysicsCartoonHead, { PhysicsCartoonHeadHandle } from "../Physics/PhysicsCartoonHead";
import MarioBrick from "../../components/MarioBrick/MarioBrick";
import BackgroundMusic from "../../components/BackgroundMusic/BackgroundMusic";
import Goomba from "../../components/Goomba/Goomba";
import Shroom from "../../components/Shroom/Shroom";
import MiniGameBackground from "../../components/MiniGameBackground/MiniGameBackground";
import BoundaryWall from "../../components/BoundryWall/BoundryWall";
import LimitReached from "../../components/LimitReached/LimitReached";

const Ground = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0],
  }));
  return (
    <mesh ref={ref} receiveShadow castShadow>
      <boxGeometry args={[1000, 10, 0.2]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
};
type MarioSceneProps = {
  headRef: React.MutableRefObject<PhysicsCartoonHeadHandle | null>;
};

const POOL_SIZE = 10;
export const levelMatrix: string[][] = [
  [".", ".", ".", ".", ".", "W"], // top row: 3 empties, 1 breakable, 1 item
  [".", ".", ".", ".", "W", "W"], // top row: 3 empties, 1 breakable, 1 item
  [".", ".", ".", "W", "W", "W"], // next row: 2 empties, 2 WonWrete, 1 item
  [".", ".", "W", "W", "W", "W"],
  [".", "W", "W", "W", "W", "W"], // row with all concrete except last is item
];
export const ItemBricksRow: string[][] = [[".", ".", ".", "B", "C", "I"]];
export const MixBreakable: string[][] = [["B", "C", ".", ".", ".", "C", "C", "B"]];
export const Pyramid: string[][] = [
  [".", ".", ".", ".", ".", "W", "W", "W", ".", ".", ".", ".", "."], // top row: 3 empties, 1 breakable, 1 item
  [".", ".", ".", ".", "W", "W", "W", "W", "W", ".", ".", ".", "."], // top row: 3 empties, 1 breakable, 1 item
  [".", ".", ".", "W", "W", "W", "W", "W", "W", "W", ".", ".", "."], // next row: 2 empties, 2 WonWrete, 1 item
  [".", ".", "W", "W", "W", "W", "W", "W", "W", "W", "W", ".", "."],
  [".", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "."], // row with all concrete except last is item
];

const MarioScene: React.FC<MarioSceneProps> = ({ headRef }) => {
  function createLevel(
    matrix: string[][],
    onItemSpawn: (pos: THREE.Vector3) => void,
    onPush: (impulse: THREE.Vector3) => void,
    startX: number,
    startY: number
  ) {
    const bricks: any[] = [];
    // Decide your top-left corner and cell sizes
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
        let spawnType: "none" | "walk" | "item" = "none";

        if (cell === "B") {
          breakable = true; // Breakable
        } else if (cell === "C") {
          breakable = false; // Concrete
        } else if (cell === "I") {
          spawnsItem = true; // Item
          spawnType = "item";
          breakable = false; // Concrete
        } else if (cell === "W") {
          spawnsItem = false; // Item
          breakable = false; // Concrete
          spawnType = "walk";
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
  const shroomModel = useFBX(`${process.env.PUBLIC_URL}/models/mario-mini/mario_shroom.fbx`) as THREE.Group;
  const [isOnBrick, setIsOnBrick] = useState(false);
  const [showLimitReached, setShowLimitReached] = useState(false);
  const [lives, setLives] = useState<number>(0);
  const [headScale, setHeadScale] = useState<[number, number, number]>([1, 2, 1]);
  const [isEnlarge, setIsEnlarge] = useState<boolean>(false);
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
    if (!headRef.current) return;
    const head = headRef.current;
    setPool((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: false, pos: new THREE.Vector3(0, -1000, 0) } : s))
    );
    setLives((prevLives) => {
      const newLives = prevLives + 1;
      if (newLives === 1) {
        animateScale(true);
        setIsEnlarge(true);
        setHeadScale((prevScale) => [head.scale.x, head.scale.y, head.scale.z]);
      }
      return newLives;
    });
  };
  const animateScale = (enlarge: boolean) => {
    if (!headRef.current) return;
    const head = headRef.current;
    if (enlarge) {
      // Start with a slight increase
      head.scale.set(1.4, 1.4, 1.4);
      // First pulse: grow
      setTimeout(() => {
        head.scale.set(1.7, 1.7, 1.7);
      }, 100);
      // Shrink back
      setTimeout(() => {
        head.scale.set(1.4, 1.4, 1.4);
      }, 200);
      // Second pulse: grow again
      setTimeout(() => {
        head.scale.set(1.7, 1.7, 1.7);
      }, 300);
      // Shrink back
      setTimeout(() => {
        head.scale.set(1.2, 1.4, 1.4);
      }, 400);
      // Finally, return to the original scale (assumed to be 1)
      setTimeout(() => {
        head.scale.set(1.3, 1.3, 1.3);
      }, 500);
      return;
    } else {
    }
    head.scale.set(1.7, 1.7, 1.7);
    // First pulse: grow
    setTimeout(() => {
      head.scale.set(1.4, 1.4, 1.4);
    }, 100);
    // Shrink back
    setTimeout(() => {
      head.scale.set(1.6, 1.6, 1.6);
    }, 200);
    // Second pulse: grow again
    setTimeout(() => {
      head.scale.set(1.2, 1.2, 1.2);
    }, 300);
    // Shrink back
    setTimeout(() => {
      head.scale.set(1.4, 1.4, 1.4);
    }, 400);
    // Finally, return to the original scale (assumed to be 1)
    setTimeout(() => {
      head.scale.set(1, 1, 1);
    }, 500);
  };
  const rejectByForce = (impulse: any) => {
    const currentPos = headRef!.current!.position.clone();
    const floorY = -1;
    const bounceTarget = new THREE.Vector3(currentPos.x, floorY, currentPos.z);
    headRef?.current?.position.set(bounceTarget.x, bounceTarget.y, bounceTarget.z);
  };

  const onHeadCollide = (e: any) => {
    // Check if the collision is with a brick.
    const type: string = e.body.userData?.type;
    console.log(type === "boundryWall" && !showLimitReached)
    if (type === "marioBrick") {
      // Here we assume that the brick’s position is the center of the brick
      // and that the brick is 1 unit high.
      // So the top of the brick is at brickPos.y + 0.5.
      setIsOnBrick(true);
    } else if (type === "boundryWall" && !showLimitReached) {
      showBoundryWarning();
    }
  };
  const showBoundryWarning = () => {
    setShowLimitReached(true);
    setTimeout(() => {
      setShowLimitReached(false);
    }, 1500);
  };

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 10, 10]} zoom={55} />
      {/* <BackgroundMusic path={"music/SuperMarioBros.mp3"} /> */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[0, 10, 10]}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Ground />
      <MiniGameBackground />
      <PhysicsCartoonHead
        ref={headRef}
        onHoverChange={() => {}}
        onCollide={onHeadCollide}
        position={[-7, 5, 0]}
        disableDrift={true}
      />

      <HeadController headRef={headRef} speed={0.1} />

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
      <Html transform position={[-10, 4, 0]}>
        <div className="end-container">
          <div className="text text_title text_title_big text_bold">Hope you've enjoyed my protfolio site!</div>
        </div>
      </Html>
      <Html transform position={[70, 4, 0]}>
        <div className="end-container">
          <div className="text text_title text_title_big text_bold">Please, feel free to contact on any subject!</div>
          <div className="text text_title text_title_big text_bold">Ohadaloni90@gmail.com</div>
        </div>
      </Html>
      <BoundaryWall position={[-19, 0, 0]} scale={[1, 100, 2]} transparent={true} mario />
      <BoundaryWall position={[77, 0, 0]} scale={[1, 100, 2]} transparent={true} mario />

      <Debug>
        {createLevel(levelMatrix, handleItemSpawn, rejectByForce, 0, 2.5)}
        {createLevel(ItemBricksRow, handleItemSpawn, rejectByForce, -7, 2)}
        {createLevel(ItemBricksRow, handleItemSpawn, rejectByForce, 10, 3)}
        {createLevel(MixBreakable, handleItemSpawn, rejectByForce, 20, 3)}
        {createLevel(Pyramid, handleItemSpawn, rejectByForce, 35, 3)}
        {createLevel(ItemBricksRow, handleItemSpawn, rejectByForce, 36, 8)}
        {createLevel(levelMatrix, handleItemSpawn, rejectByForce, 55, 2.5)}
        {showLimitReached && (
  <LimitReached rotation={[0,0,0]} position={[77,4,0]} />
)}

        <Goomba headRef={headRef} />
        <Goomba headRef={headRef} position={[20, -1.8, 0]} />
        <Goomba headRef={headRef} position={[12, -1.8, 0]} />
      </Debug>
    </>
  );
};

export default MarioScene;
