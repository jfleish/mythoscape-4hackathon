"use client";

interface BookshelfProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  shelves?: number;
}

export function Bookshelf({
  position,
  rotation = [0, 0, 0],
  width = 3,
  shelves = 4,
}: BookshelfProps) {
  const depth = 0.35;
  const height = 3.5;
  const shelfThickness = 0.04;
  const sideThickness = 0.06;
  const shelfColor = "#5c3a1e";

  const shelfPositions: number[] = [];
  for (let i = 0; i <= shelves; i++) {
    shelfPositions.push((i / shelves) * (height - shelfThickness));
  }

  return (
    <group position={position} rotation={rotation}>
      {/* Left side panel */}
      <mesh position={[-width / 2 + sideThickness / 2, height / 2, 0]} castShadow>
        <boxGeometry args={[sideThickness, height, depth]} />
        <meshStandardMaterial color={shelfColor} roughness={0.7} />
      </mesh>

      {/* Right side panel */}
      <mesh position={[width / 2 - sideThickness / 2, height / 2, 0]} castShadow>
        <boxGeometry args={[sideThickness, height, depth]} />
        <meshStandardMaterial color={shelfColor} roughness={0.7} />
      </mesh>

      {/* Back panel */}
      <mesh position={[0, height / 2, -depth / 2 + 0.01]} castShadow>
        <boxGeometry args={[width, height, 0.02]} />
        <meshStandardMaterial color="#3d2310" roughness={0.9} />
      </mesh>

      {/* Shelf planks */}
      {shelfPositions.map((y, i) => (
        <mesh key={i} position={[0, y + shelfThickness / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width - sideThickness * 2, shelfThickness, depth]} />
          <meshStandardMaterial color={shelfColor} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
