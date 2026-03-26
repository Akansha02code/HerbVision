import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Float, Sparkles, Environment } from "@react-three/drei";

const Leaf = ({ color, ...props }: any) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.3, 0.4, 0.2, 1.0, 0, 1.4);
    s.bezierCurveTo(-0.2, 1.0, -0.3, 0.4, 0, 0);
    return s;
  }, []);

  const geometry = useMemo(() => {
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
    });
  }, [shape]);

  return (
    <mesh geometry={geometry} {...props}>
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.35} 
        roughness={0.2}
        metalness={0.1}
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
};

const LeafVortex = ({ count = 35 }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const leafData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12 - 4
      ] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
      scale: 0.4 + Math.random() * 0.8,
      speed: 0.1 + Math.random() * 0.4,
      color: i % 2 === 0 ? "#2d8a4e" : "#84cc16",
      offset: Math.random() * 100
    }));
  }, [count]);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating vortex rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
      
      // Dynamic shift based on mouse
      const targetX = state.mouse.x * 0.5;
      const targetY = state.mouse.y * 0.5;
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.02;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {leafData.map((data, i) => (
        <Float 
          key={i} 
          speed={data.speed * 2} 
          rotationIntensity={1.5} 
          floatIntensity={1.5}
          position={data.position}
        >
          <Leaf 
            rotation={data.rotation} 
            scale={data.scale} 
            color={data.color}
          />
        </Float>
      ))}
    </group>
  );
};

const Dashboard3DBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <fog attach="fog" args={["#f0fdf4", 5, 20]} />
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#84cc16" />
        <pointLight position={[-10, -5, 5]} intensity={1} color="#2d8a4e" />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} castShadow />
        
        <LeafVortex />
        <Sparkles count={80} scale={15} size={3} speed={0.4} opacity={0.5} color="#84cc16" />
        
        <Environment preset="forest" />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50/20 via-transparent to-lime-50/20" />
    </div>
  );
};

export default Dashboard3DBackground;
