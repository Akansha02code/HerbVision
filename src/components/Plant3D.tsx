import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Float, Environment } from "@react-three/drei";

const Leaf = ({ position, rotation, scale, color }: any) => {
  const ref = useRef<THREE.Mesh>(null);

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.3, 0.4, 0.2, 1.0, 0, 1.4);
    s.bezierCurveTo(-0.2, 1.0, -0.3, 0.4, 0, 0);
    return s;
  }, []);

  const geometry = useMemo(() => {
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 3,
    });
  }, [shape]);

  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale} geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Stem = () => {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -2, 0),
      new THREE.Vector3(0.1, -1, 0.1),
      new THREE.Vector3(-0.05, 0, -0.05),
      new THREE.Vector3(0.05, 1, 0.05),
      new THREE.Vector3(0, 2, 0),
    ]);
  }, []);

  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 32, 0.06, 8, false);
  }, [curve]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#2d7a4f" roughness={0.6} metalness={0.05} />
    </mesh>
  );
};

const PlantModel = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const leaves = [
    { pos: [0.15, 1.5, 0] as any, rot: [0.3, 0, 0.5] as any, sc: 1.2, color: "#2d8a4e" },
    { pos: [-0.2, 1.2, 0.1] as any, rot: [-0.2, 1.5, -0.6] as any, sc: 1.0, color: "#3a9d5c" },
    { pos: [0.1, 0.6, -0.15] as any, rot: [0.4, 2.8, 0.3] as any, sc: 1.1, color: "#48ab5e" },
    { pos: [-0.15, 0.2, 0.1] as any, rot: [-0.3, -1.2, -0.4] as any, sc: 0.9, color: "#2d8a4e" },
    { pos: [0.2, -0.3, -0.1] as any, rot: [0.5, 0.8, 0.7] as any, sc: 0.85, color: "#5cb86b" },
    { pos: [-0.1, -0.8, 0.15] as any, rot: [-0.4, -2.5, -0.3] as any, sc: 1.0, color: "#3a9d5c" },
  ];

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef} scale={1.2}>
        <Stem />
        {leaves.map((l, i) => (
          <Leaf key={i} position={l.pos} rotation={l.rot} scale={l.sc} color={l.color} />
        ))}
        {/* Small glowing orbs */}
        {[[-0.3, 1.8, 0.2], [0.35, 0.8, -0.2], [-0.25, -0.5, 0.3]].map((pos, i) => (
          <mesh key={`orb-${i}`} position={pos as any} scale={0.06}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={2} />
          </mesh>
        ))}
      </group>
    </Float>
  );
};

const Plant3D = () => (
  <div className="h-[400px] w-full md:h-[500px]">
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-3, 3, -3]} intensity={0.3} color="#a3e635" />
      <PlantModel />
      <Environment preset="forest" />
    </Canvas>
  </div>
);

export default Plant3D;
