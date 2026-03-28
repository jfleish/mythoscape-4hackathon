"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CameraOrbit {
  center: [number, number, number];
  radiusX: number;
  radiusZ: number;
  heightBase: number;
  heightAmp: number;
  speed: number;
}

interface BookWorldCameraProps {
  spawnPosition: [number, number, number];
  spawnTarget: [number, number, number];
  orbit?: CameraOrbit;
}

const DEFAULT_ORBIT: CameraOrbit = {
  center: [0, 0, 0],
  radiusX: 3,
  radiusZ: 2.5,
  heightBase: 1.8,
  heightAmp: 0.3,
  speed: 0.03,
};

const LOOK_AHEAD = 0.4;
const RESUME_DELAY = 4000;

export function BookWorldCamera({
  spawnPosition,
  spawnTarget,
  orbit,
}: BookWorldCameraProps) {
  const { camera, gl } = useThree();
  const angleRef = useRef(0);
  const autoWalkRef = useRef(true);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posVec = useRef(new THREE.Vector3());
  const lookVec = useRef(new THREE.Vector3());

  const o = orbit ?? DEFAULT_ORBIT;
  const [cx, , cz] = o.center;

  useEffect(() => {
    camera.position.set(...spawnPosition);
    camera.lookAt(...spawnTarget);
    angleRef.current = Math.atan2(
      spawnPosition[2] - cz,
      spawnPosition[0] - cx
    );
  }, [camera, spawnPosition, spawnTarget, cx, cz]);

  const pauseAutoWalk = useCallback(() => {
    autoWalkRef.current = false;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      autoWalkRef.current = true;
    }, RESUME_DELAY);
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", pauseAutoWalk);
    canvas.addEventListener("wheel", pauseAutoWalk);
    return () => {
      canvas.removeEventListener("pointerdown", pauseAutoWalk);
      canvas.removeEventListener("wheel", pauseAutoWalk);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [gl, pauseAutoWalk]);

  useFrame((_, delta) => {
    if (!autoWalkRef.current) return;

    angleRef.current += o.speed * delta;
    const a = angleRef.current;

    // Camera position: orbit around the scene center
    const px = cx + Math.cos(a) * o.radiusX;
    const pz = cz + Math.sin(a) * o.radiusZ;
    const py = o.heightBase + Math.sin(a * 2) * o.heightAmp;

    // Look-at: ahead on the path, outward from center
    const la = a + LOOK_AHEAD;
    const lookRadius = Math.max(o.radiusX, o.radiusZ) * 1.5;
    const lx = cx + Math.cos(la) * lookRadius;
    const lz = cz + Math.sin(la) * lookRadius;
    const ly = o.heightBase + 1;

    posVec.current.set(px, py, pz);
    lookVec.current.set(lx, ly, lz);

    // Smooth interpolation
    camera.position.lerp(posVec.current, 0.02);

    const currentLook = new THREE.Vector3();
    camera.getWorldDirection(currentLook);
    const desiredDir = lookVec.current.clone().sub(camera.position).normalize();
    currentLook.lerp(desiredDir, 0.02);
    camera.lookAt(camera.position.clone().add(currentLook));
  });

  return null;
}
