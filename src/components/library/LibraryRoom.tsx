"use client";

export function LibraryRoom() {
  const roomWidth = 12;
  const roomDepth = 10;
  const roomHeight = 5;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, roomHeight, 0]}
        receiveShadow
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial color="#2a1f14" roughness={0.9} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, roomHeight / 2, -roomDepth / 2]} receiveShadow>
        <planeGeometry args={[roomWidth, roomHeight]} />
        <meshStandardMaterial color="#4a3728" roughness={0.85} />
      </mesh>

      {/* Left wall */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-roomWidth / 2, roomHeight / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        <meshStandardMaterial color="#4a3728" roughness={0.85} />
      </mesh>

      {/* Right wall */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[roomWidth / 2, roomHeight / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        <meshStandardMaterial color="#4a3728" roughness={0.85} />
      </mesh>

      {/* Ambient light -- warm glow */}
      <ambientLight intensity={0.3} color="#ffdbb0" />

      {/* Main overhead warm light */}
      <pointLight
        position={[0, 4.5, 0]}
        intensity={30}
        color="#ffcf8a"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Accent lights */}
      <pointLight position={[-4, 3, -2]} intensity={8} color="#ffa54f" />
      <pointLight position={[4, 3, -2]} intensity={8} color="#ffa54f" />

      {/* Subtle backlight */}
      <pointLight position={[0, 2, 4]} intensity={5} color="#b8860b" />
    </group>
  );
}
