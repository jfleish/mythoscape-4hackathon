"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useAppStore } from "@/stores/useAppStore";
import { LibraryScene } from "./library/LibraryScene";
import { BookWorldScene } from "./book-world/BookWorldScene";
import { LoadingScreen } from "./LoadingScreen";

export function MainCanvas() {
  const currentScene = useAppStore((s) => s.currentScene);

  return (
    <Canvas
      gl={{ antialias: true, alpha: false }}
      camera={{ fov: 60, near: 0.1, far: 1000, position: [0, 2.5, 5] }}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <Suspense fallback={<LoadingScreen />}>
        {currentScene === "library" && <LibraryScene />}
        {currentScene === "book" && <BookWorldScene />}
      </Suspense>
    </Canvas>
  );
}
