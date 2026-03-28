import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import { Suspense, useState, useCallback, forwardRef } from "react";
import * as THREE from "three";

interface BookData {
  id: string;
  title: string;
  author: string;
  description: string | null;
  dewey_label: string;
  thumbnail_url: string | null;
}

interface LibrarySceneProps {
  books: BookData[];
  onSelectBook: (bookId: string) => void;
}

const Bookshelf = forwardRef<THREE.Group, {
  position: [number, number, number];
  books: BookData[];
  onSelectBook: (id: string) => void;
  onHoverBook: (id: string | null) => void;
}>(({ position, books, onSelectBook, onHoverBook }, ref) => {
  const shelfColor = "#5c3a1e";
  const shelfWidth = 4;
  const shelfDepth = 0.6;

  return (
    <group position={position} ref={ref}>
      {/* Back panel */}
      <mesh position={[0, 1.5, -shelfDepth / 2]}>
        <boxGeometry args={[shelfWidth + 0.2, 3.2, 0.08]} />
        <meshStandardMaterial color="#3d2510" />
      </mesh>

      {/* Side panels */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (shelfWidth / 2 + 0.05), 1.5, 0]}>
          <boxGeometry args={[0.1, 3.2, shelfDepth + 0.1]} />
          <meshStandardMaterial color={shelfColor} />
        </mesh>
      ))}

      {/* Three shelf levels */}
      {[0, 1.05, 2.1].map((y, shelfIndex) => (
        <group key={shelfIndex}>
          <mesh position={[0, y, 0]}>
            <boxGeometry args={[shelfWidth + 0.1, 0.08, shelfDepth]} />
            <meshStandardMaterial color={shelfColor} />
          </mesh>

          {books.slice(shelfIndex, shelfIndex + 1).map((book, i) => (
            <BookMesh
              key={book.id}
              book={book}
              position={[
                -shelfWidth / 2 + 0.6 + i * 0.35,
                y + 0.45,
                0,
              ]}
              onSelect={onSelectBook}
              onHover={onHoverBook}
            />
          ))}
        </group>
      ))}

      {/* Top molding */}
      <mesh position={[0, 3.15, 0.05]}>
        <boxGeometry args={[shelfWidth + 0.3, 0.12, shelfDepth + 0.2]} />
        <meshStandardMaterial color={shelfColor} />
      </mesh>
    </group>
  );
});
Bookshelf.displayName = "Bookshelf";

const BookMesh = forwardRef<THREE.Group, {
  book: BookData;
  position: [number, number, number];
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}>(({ book, position, onSelect, onHover }, ref) => {
  const [hovered, setHovered] = useState(false);

  const bookColors: Record<string, string> = {
    "Alice's Adventures in Wonderland": "#4a90d9",
    "Treasure Island": "#c4763c",
    "Frankenstein": "#6b3a6b",
  };

  const color = bookColors[book.title] || "#8b4513";
  const bookHeight = 0.75;
  const bookWidth = 0.18;
  const bookDepth = 0.5;

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(book.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onHover(null);
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(book.id);
      }}
    >
      <mesh
        position={[0, 0, hovered ? 0.15 : 0]}
        scale={hovered ? [1.05, 1.05, 1.05] : [1, 1, 1]}
      >
        <boxGeometry args={[bookWidth, bookHeight, bookDepth]} />
        <meshStandardMaterial
          color={color}
          emissive={hovered ? color : "#000000"}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Spine label */}
      <Text
        position={[bookWidth / 2 + 0.001, 0, hovered ? 0.15 : 0]}
        rotation={[0, Math.PI / 2, Math.PI / 2]}
        fontSize={0.06}
        maxWidth={bookHeight * 0.8}
        color="#f0e6d3"
        anchorX="center"
        anchorY="middle"
      >
        {book.title.length > 18 ? book.title.slice(0, 18) + "…" : book.title}
      </Text>

      {hovered && (
        <pointLight
          position={[0, 0, 0.5]}
          intensity={0.8}
          distance={2}
          color="#ffd700"
        />
      )}
    </group>
  );
});
BookMesh.displayName = "BookMesh";

function LibraryRoom() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a1a0e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3, -4]} receiveShadow>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#1a120a" roughness={0.9} />
      </mesh>
      <mesh position={[-6, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#1a120a" roughness={0.9} />
      </mesh>
      <mesh position={[6, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#1a120a" roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0d0906" roughness={1} />
      </mesh>
    </group>
  );
}

function LampLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 0.3, 8]} />
        <meshStandardMaterial color="#d4a050" emissive="#d4a050" emissiveIntensity={0.3} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.5]} />
        <meshStandardMaterial color="#8b7355" metalness={0.8} />
      </mesh>
      <pointLight position={[0, -0.3, 0]} intensity={2} distance={8} color="#ffb347" castShadow />
    </group>
  );
}

function WelcomeSign() {
  return (
    <Float speed={1} rotationIntensity={0} floatIntensity={0.3}>
      <group position={[0, 4.2, -3.8]}>
        <Text
          fontSize={0.35}
          color="#d4a050"
          anchorX="center"
          anchorY="middle"
        >
          THE GRAND LIBRARY
        </Text>
        <Text
          position={[0, -0.4, 0]}
          fontSize={0.14}
          color="#a08060"
          anchorX="center"
          anchorY="middle"
        >
          Select a book to enter its world
        </Text>
      </group>
    </Float>
  );
}

export default function LibraryScene({ books, onSelectBook }: LibrarySceneProps) {
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);

  const handleHover = useCallback((id: string | null) => {
    setHoveredBook(id);
  }, []);

  const hoveredData = books.find((b) => b.id === hoveredBook);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <Canvas
        shadows
        camera={{ position: [0, 2.5, 6], fov: 55 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#0a0705"]} />
          <fog attach="fog" args={["#0a0705", 8, 20]} />

          <ambientLight intensity={0.15} color="#ffd4a0" />
          <directionalLight position={[2, 5, 3]} intensity={0.3} color="#ffeedd" castShadow />

          <LampLight position={[-2, 5, 0]} />
          <LampLight position={[2, 5, 0]} />

          <LibraryRoom />
          <WelcomeSign />

          <Bookshelf
            position={[0, 0, -3.5]}
            books={books}
            onSelectBook={onSelectBook}
            onHoverBook={handleHover}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={10}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 1.5, -1]}
          />
        </Suspense>
      </Canvas>

      {/* HUD overlay */}
      {hoveredData && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
          className="glass-card px-6 py-4 max-w-md text-center animate-in fade-in duration-200"
        >
          <h3 className="font-display font-bold text-lg text-foreground">
            {hoveredData.title}
          </h3>
          <p className="text-sm text-muted-foreground">by {hoveredData.author}</p>
          {hoveredData.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {hoveredData.description}
            </p>
          )}
          <p className="text-xs text-primary mt-2 font-medium">Click to enter this world →</p>
        </div>
      )}
    </div>
  );
}
