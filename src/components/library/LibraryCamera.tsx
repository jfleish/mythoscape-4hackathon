"use client";

import { CameraControls } from "@react-three/drei";
import { useRef, useEffect } from "react";
import type CameraControlsImpl from "camera-controls";

export function LibraryCamera() {
  const controlsRef = useRef<CameraControlsImpl>(null);

  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    controls.setLookAt(0, 2.5, 5, 0, 1.5, -2, true);
  }, []);

  return (
    <CameraControls
      ref={controlsRef}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.2}
      minDistance={2}
      maxDistance={8}
      dollySpeed={0.5}
    />
  );
}
