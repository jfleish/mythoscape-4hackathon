import { Canvas, useFrame } from "@react-three/fiber";
import { Splat, OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

function AutoRotateCamera() {
  const controlsRef = useRef<any>(null);

  useFrame((_, delta) => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 1.5;
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate
      autoRotateSpeed={1.5}
      enableDamping
      dampingFactor={0.05}
      minDistance={2}
      maxDistance={15}
      target={[0, 0, 0]}
    />
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#d4a050" wireframe />
    </mesh>
  );
}

export default function MonkeyKing() {
  return (
    <div className="w-full h-screen relative bg-black">
      <Link
        to="/"
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur-sm px-3 py-2 rounded-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </Link>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Monkey King
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          3D Gaussian Splat · Drag to orbit
        </p>
      </div>

      <Canvas
        camera={{ position: [5, 3, 5], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />

        <Suspense fallback={<LoadingFallback />}>
          <Splat src="/splats/monkey_king.spz" />
        </Suspense>

        <AutoRotateCamera />
      </Canvas>
    </div>
  );
}
