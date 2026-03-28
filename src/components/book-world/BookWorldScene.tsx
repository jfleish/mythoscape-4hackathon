"use client";

import { useGLTF } from "@react-three/drei";
import { BookWorldCamera } from "./BookWorldCamera";
import { useAppStore } from "@/stores/useAppStore";

export function BookWorldScene() {
  const selectedBook = useAppStore((s) => s.selectedBook);

  if (!selectedBook?.modelUrl) return null;

  return (
    <group>
      <BookWorldModel url={selectedBook.modelUrl} />
      <BookWorldCamera
        spawnPosition={selectedBook.cameraSpawn.position}
        spawnTarget={selectedBook.cameraSpawn.target}
        orbit={selectedBook.cameraOrbit}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
    </group>
  );
}

function BookWorldModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}
