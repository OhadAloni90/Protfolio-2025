import * as THREE from 'three'
import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { DarkModeProvider, useDarkMode } from '../../providers/DarkModeProvider/DarkModeProvider';

interface FliesObject {
  count: number;
  mouse: any;
}

export default function Flies({ count, mouse }: FliesObject) {
  const { state } = useDarkMode();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate random particle data with smaller offsets.
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 10;
      const factor = 20 + Math.random() * 100;
      const speed = 0.005 + Math.random() / 400;
      // Reduced range: from -10 to +10 instead of -50 to +50.
      const xFactor = -10 + Math.random() * 20;
      const yFactor = -10 + Math.random() * 20;
      const zFactor = -10 + Math.random() * 20;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  // The innards of this hook will run every frame.
  useFrame((state) => {
    if (light.current) {
      light.current.position.set(
        mouse.current[0] / aspect,
        -mouse.current[1] / aspect,
        0
      );
    }
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      particle.mx += (mouse.current[0] - particle.mx) * 0.001;
      particle.my += (mouse.current[1] * -1 - particle.my) * 0.001;
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) {
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });
  
  return (
    <>
      <pointLight ref={light} distance={10} intensity={1} color={'green'} />
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[0.1, 0]} />
        <meshPhongMaterial color="green" emissive="lime" emissiveIntensity={2} />
      </instancedMesh>
    </>
  );
}
