"use client";

import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { BookMeta } from "@/types/book";
import { useAppStore } from "@/stores/useAppStore";

interface BookModelProps {
  book: BookMeta;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export function BookModel({
  book,
  position,
  rotation = [0, 0, 0],
}: BookModelProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<Mesh>(null);
  const selectBook = useAppStore((s) => s.selectBook);

  const bookWidth = 0.18;
  const bookHeight = 0.26;
  const bookDepth = 0.04;

  useFrame(() => {
    if (!meshRef.current) return;
    const targetScale = hovered ? 1.1 : 1.0;
    meshRef.current.scale.lerp(
      { x: targetScale, y: targetScale, z: targetScale } as never,
      0.1
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectBook(book.bookId);
      }}
      castShadow
    >
      <boxGeometry args={[bookWidth, bookHeight, bookDepth]} />
      <meshStandardMaterial
        color={book.spineColor}
        roughness={0.6}
        metalness={0.1}
        emissive={book.spineColor}
        emissiveIntensity={hovered ? 0.4 : 0}
      />
    </mesh>
  );
}
