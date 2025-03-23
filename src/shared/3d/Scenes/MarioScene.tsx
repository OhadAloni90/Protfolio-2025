import React, { useEffect, useRef, useState } from "react";
import { Html, OrthographicCamera, useFBX } from "@react-three/drei";
import { Debug, usePlane } from "@react-three/cannon";
import * as THREE from "three";
import HeadController from "../Controllers/HeadController";
import PhysicsCartoonHead, { PhysicsCartoonHeadHandle } from "../Physics/PhysicsCartoonHead";
import MarioBrick from "../../components/MarioBrick/MarioBrick";
import BackgroundMusic from "../../components/BackgroundMusic/BackgroundMusic";
import Goomba from "../../components/Goomba/Goomba";
import Shroom from "../../components/Shroom/Shroom";
import MiniGameBackground from "../../components/MiniGameBackground/MiniGameBackground";
import BoundaryWall from "../../components/BoundryWall/BoundryWall";
import LimitReached from "../../components/LimitReached/LimitReached";
import FireFlower from "../../components/FireFlower/FireFlower";
import Fireball from "../../components/FireBall/FireBall";

const Ground = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0],
    restitution: 0.8, // add this line for bounciness
    friction: 0.3, // lower friction can help bounces
    userData: { type: "ground" },
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
    onItemSpawn: (pos: THREE.Vector3, itemType: "shroom" | "fireflower") => void,
    onPush: (impulse: THREE.Vector3) => void,
    startX: number,
    startY: number
  ) {
    const bricks: any[] = [];
    const cellWidth = 1;
    const cellHeight = 1;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        const cell = matrix[r][c];
        if (cell === ".") continue;
        const x = startX + c * cellWidth;
        const y = startY - r * cellHeight;
        let breakable = false;
        let spawnsItem = false;
        let spawnType: "none" | "walk" | "item" = "none";
        if (cell === "B") {
          breakable = true;
        } else if (cell === "C") {
          breakable = false;
        } else if (cell === "I") {
          spawnsItem = true;
          spawnType = "item";
          breakable = false;
        } else if (cell === "W") {
          spawnsItem = false;
          breakable = false;
          spawnType = "walk";
        }
        bricks.push(
          <MarioBrick
            key={`r${r}-c${c}`}
            position={[x, y, 0]}
            breakable={breakable}
            spawnsItem={spawnsItem}
            spawnType={spawnType}
            // Now itemType is guaranteed to be defined.
            onItemSpawn={(pos, itemType) => onItemSpawn(pos, itemType)}
            onPush={onPush}
            isEnlarge={isEnlarge}
          />
        );
      }
    }
    return bricks;
  }

  // Preload the shroom model once.
  const shroomModel = useFBX(`${process.env.PUBLIC_URL}/models/mario-mini/mario_shroom.fbx`) as THREE.Group;
  const fireFlowerModel = useFBX(`${process.env.PUBLIC_URL}/models/mario-mini/FireFlower.fbx`) as THREE.Group;
  const [fireballs, setFireballs] = useState<Array<{ id: number; pos: THREE.Vector3; velocity: THREE.Vector3 }>>([]);
  const nextFireballId = useRef(0);

  const [fireFlowerData, setFireFlowerData] = useState<{ active: boolean; pos: THREE.Vector3 }>({
    active: false,
    pos: new THREE.Vector3(0, -1000, 0),
  });

  const [isOnBrick, setIsOnBrick] = useState(false);
  const [showLimitReached, setShowLimitReached] = useState(false);
  const [lives, setLives] = useState<number>(0);
  const [headScale, setHeadScale] = useState<[number, number, number]>([1, 2, 1]);
  const [isEnlarge, setIsEnlarge] = useState<boolean>(false);
  const [hasFireFlower, setHasFireFlower] = useState(false);
  // Create a pool of shroom instances.
  const [pool, setPool] = useState<Array<{ id: number; active: boolean; pos: THREE.Vector3 }>>(
    Array.from({ length: POOL_SIZE }, (_, i) => ({
      id: i,
      active: false,
      pos: new THREE.Vector3(0, -1000, 0), // Initially offscreen.
    }))
  );
  const handleFireball = (pos: THREE.Vector3, direction: THREE.Vector3) => {
    const speed = 5;
    const velocity = direction.clone().multiplyScalar(speed);
    const id = nextFireballId.current++;
    setFireballs((prev) => [...prev, { id, pos, velocity }]);
  };

  // When a brick is hit, activate one shroom from the pool.
  const handleItemSpawn = (brickPos: THREE.Vector3, itemType: string) => {
    // If Mario is already enlarged, spawn the fire flower instead.
    if (isEnlarge || itemType === "fireflower") {
      setLives((prevLives: number) => {
        const newLives = 2;
        return newLives;
      });
      spawnFireFlower(brickPos);
      return;
    }
    // Otherwise, spawn a shroom from your pool.
    setPool((prev) => {
      const inactive = prev.find((s) => !s.active);
      if (!inactive) {
        console.warn("No more shrooms in the pool!");
        return prev;
      }
      inactive.active = true;
      // Adjust position so the shroom appears above the brick.
      inactive.pos = brickPos.clone().add(new THREE.Vector3(0, 1, 0));
      return [...prev];
    });
  };

  const handleFireFlowerCollected = (id: number) => {
    setFireFlowerData({ active: false, pos: new THREE.Vector3(0, -1000, 0) });
    setHasFireFlower(true);
    setLives((prevLives) => {
      const newLives = prevLives + 1;
      return newLives;
    });
  };

  const handleShroomCollected = (id: number) => {
    // Mark the shroom as inactive.
    setPool((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: false, pos: new THREE.Vector3(0, -1000, 0) } : s))
    );
    // Otherwise, this is Mario's first power-up.
    setLives((prevLives) => {
      const newLives = prevLives + 1;
      if (newLives === 1) {
        animateScale(true);
        setIsEnlarge(true);
      }
      return newLives;
    });
  };

  const spawnFireFlower = (pos: THREE.Vector3) => {
    setFireFlowerData({ active: true, pos });
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
  const onHeadHit = () => {
    setLives((prevLives: number) => {
      const newLives = prevLives - 1;
      if (newLives === 0) {
        animateScale(false);
        setIsEnlarge(false);
      } else if (newLives === 1) setHasFireFlower(false);
      return newLives;
    });
    console.log(lives);
  };
  useEffect(() => {
    if (headRef.current) {
      headRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((mat) => {
              const material = (mat as THREE.MeshStandardMaterial).clone();
              if (hasFireFlower) {
                material.emissive = new THREE.Color(0xffffff);
                material.emissiveIntensity = 0.7;
              } else {
                material.emissive = new THREE.Color(0x000000);
                material.emissiveIntensity = 0;
              }
              return material;
            });
          } else {
            const material = (mesh.material as THREE.MeshStandardMaterial).clone();
            if (hasFireFlower) {
              material.emissive = new THREE.Color(0xffffff);
              material.emissiveIntensity = 0.5;
            } else {
              material.emissive = new THREE.Color(0x000000);
              material.emissiveIntensity = 0;
            }
            mesh.material = material;
          }
        }
      });
    }
  }, [hasFireFlower, headRef]);

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
        position={[-15, 5, 0]}
        disableDrift={true}
        isEnlarge={isEnlarge}
      />
      <HeadController
        headRef={headRef}
        speed={0.1}
        onFireball={handleFireball}
        canShoot={hasFireFlower} // Only allow shooting if fireflower power-up is active.
      />
      {fireballs.map((fb) => (
        <Fireball
          key={fb.id}
          id={fb.id}
          position={[fb.pos.x, fb.pos.y, fb.pos.z]}
          velocity={[fb.velocity.x, fb.velocity.y, fb.velocity.z]}
          onRemove={(id) => setFireballs((prev) => prev.filter((f) => f.id !== id))}
        />
      ))}
      {fireFlowerData.active && (
        <FireFlower
          id={0}
          active={fireFlowerData.active}
          position={[fireFlowerData.pos.x, fireFlowerData.pos.y + 0.5, fireFlowerData.pos.z]}
          model={fireFlowerModel}
          onCollected={handleFireFlowerCollected}
        />
      )}

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
      <BoundaryWall position={[77, 0, 0]} scale={[2, 100, 2]} transparent={true} mario />
      {/* <Debug> */}
      {createLevel(levelMatrix, handleItemSpawn, rejectByForce, 0, 2.5)}
      {createLevel(ItemBricksRow, handleItemSpawn, rejectByForce, -7, 2)}
      {createLevel(ItemBricksRow, handleItemSpawn, rejectByForce, 10, 3)}
      {createLevel(MixBreakable, handleItemSpawn, rejectByForce, 20, 3)}
      {createLevel(Pyramid, handleItemSpawn, rejectByForce, 35, 3)}
      {createLevel(ItemBricksRow, handleItemSpawn, rejectByForce, 36, 8)}
      {createLevel(levelMatrix, handleItemSpawn, rejectByForce, 55, 2.5)}
      {showLimitReached && <LimitReached rotation={[0, 0, 0]} position={[77, 4, 0]} />}

      <Goomba headRef={headRef} onHit={onHeadHit} />
      <Goomba headRef={headRef} position={[20, -1.8, 0]} onHit={onHeadHit} />
      <Goomba headRef={headRef} position={[12, -1.8, 0]} onHit={onHeadHit} />
      {/* </Debug> */}
    </>
  );
};

export default MarioScene;
