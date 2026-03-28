import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, PointerLockControls } from "@react-three/drei";
import { Suspense, useState, useCallback, useRef, useEffect, forwardRef, useMemo } from "react";
import * as THREE from "three";

// ─── Types ───

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

// ─── Random seeded color palette for decorative books ───

const DECO_COLORS = [
  "#8B4513", "#A0522D", "#6B3A2A", "#4A2E1A", "#2F1B0E",
  "#1B3A2A", "#2C4A3E", "#3B2F2F", "#4A3728", "#5C4033",
  "#6E5040", "#704214", "#556B2F", "#483D8B", "#8B0000",
  "#2E0854", "#1C1C3A", "#3C1414", "#4B0082", "#191970",
  "#2F4F4F", "#36454F", "#343434", "#5D3A1A", "#7B3F00",
];

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// ─── WASD Movement Controller ───

function MovementController({ speed = 4 }: { speed?: number }) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const k = keys.current;
    const forward = (k["KeyW"] || k["ArrowUp"]) ? 1 : (k["KeyS"] || k["ArrowDown"]) ? -1 : 0;
    const strafe = (k["KeyA"] || k["ArrowLeft"]) ? 1 : (k["KeyD"] || k["ArrowRight"]) ? -1 : 0;

    direction.current.set(0, 0, 0);

    if (forward !== 0 || strafe !== 0) {
      const frontVector = new THREE.Vector3(0, 0, -forward);
      const sideVector = new THREE.Vector3(-strafe, 0, 0);
      direction.current
        .addVectors(frontVector, sideVector)
        .normalize()
        .applyQuaternion(camera.quaternion);
      direction.current.y = 0; // keep on ground
      direction.current.normalize();
    }

    velocity.current.lerp(direction.current.multiplyScalar(speed), 0.15);
    camera.position.add(velocity.current.clone().multiplyScalar(delta));

    // Clamp position within library bounds
    camera.position.x = Math.max(-9, Math.min(9, camera.position.x));
    camera.position.z = Math.max(-14, Math.min(8, camera.position.z));
    camera.position.y = 1.7; // eye height
  });

  return null;
}

// ─── Single decorative book ───

function DecoBook({ position, height, width, depth, color, rotation }: {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  color: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

// ─── Row of decorative books on a shelf ───

function DecoBookRow({ shelfY, shelfZ, shelfX, shelfWidth, seed, facing }: {
  shelfY: number;
  shelfZ: number;
  shelfX: number;
  shelfWidth: number;
  seed: number;
  facing: "front" | "back";
}) {
  const books = useMemo(() => {
    const result: JSX.Element[] = [];
    let x = -shelfWidth / 2 + 0.12;
    let i = 0;
    while (x < shelfWidth / 2 - 0.1) {
      const r = seededRandom(seed + i * 137);
      const w = 0.06 + r * 0.1;
      const h = 0.55 + seededRandom(seed + i * 73) * 0.3;
      const d = 0.35 + seededRandom(seed + i * 41) * 0.15;
      const color = DECO_COLORS[Math.floor(seededRandom(seed + i * 211) * DECO_COLORS.length)];
      const tilt = (seededRandom(seed + i * 97) - 0.5) * 0.06;
      const zOffset = facing === "back" ? -d / 2 : d / 2;

      result.push(
        <DecoBook
          key={`${seed}-${i}`}
          position={[shelfX + x + w / 2, shelfY + h / 2 + 0.04, shelfZ + zOffset]}
          height={h}
          width={w}
          depth={d}
          color={color}
          rotation={[0, 0, tilt]}
        />
      );
      x += w + 0.015;
      i++;
    }
    return result;
  }, [shelfY, shelfZ, shelfX, shelfWidth, seed, facing]);

  return <>{books}</>;
}

// ─── A tall bookshelf unit ───

function BookshelfUnit({ position, width = 3, shelves = 5, facing = "front" as "front" | "back", seed = 0 }: {
  position: [number, number, number];
  width?: number;
  shelves?: number;
  facing?: "front" | "back";
  seed?: number;
}) {
  const shelfColor = "#3d2510";
  const frameColor = "#2a1808";
  const totalHeight = shelves * 0.85 + 0.3;
  const depth = 0.55;

  return (
    <group position={position}>
      {/* Back panel */}
      <mesh position={[0, totalHeight / 2, facing === "front" ? -depth / 2 : depth / 2]}>
        <boxGeometry args={[width, totalHeight, 0.05]} />
        <meshStandardMaterial color={frameColor} roughness={0.95} />
      </mesh>

      {/* Side panels */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2), totalHeight / 2, 0]}>
          <boxGeometry args={[0.06, totalHeight, depth]} />
          <meshStandardMaterial color={shelfColor} roughness={0.9} />
        </mesh>
      ))}

      {/* Shelves + books */}
      {Array.from({ length: shelves + 1 }).map((_, i) => {
        const y = i * 0.85;
        return (
          <group key={i}>
            <mesh position={[0, y, 0]}>
              <boxGeometry args={[width, 0.05, depth]} />
              <meshStandardMaterial color={shelfColor} roughness={0.9} />
            </mesh>
            {i < shelves && (
              <DecoBookRow
                shelfY={y}
                shelfZ={0}
                shelfX={0}
                shelfWidth={width - 0.15}
                seed={seed + i * 1000}
                facing={facing}
              />
            )}
          </group>
        );
      })}

      {/* Top crown */}
      <mesh position={[0, totalHeight + 0.04, 0]}>
        <boxGeometry args={[width + 0.1, 0.08, depth + 0.06]} />
        <meshStandardMaterial color={shelfColor} roughness={0.85} />
      </mesh>
    </group>
  );
}

// ─── Interactive book (the 3 clickable ones) ───

const InteractiveBook = forwardRef<THREE.Group, {
  book: BookData;
  position: [number, number, number];
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}>(({ book, position, onSelect, onHover }, ref) => {
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.PointLight>(null);

  const bookColors: Record<string, string> = {
    "Alice's Adventures in Wonderland": "#3a7bd5",
    "Treasure Island": "#d4763c",
    "Frankenstein": "#7b3f9e",
  };

  const color = bookColors[book.title] || "#c4a35a";
  const h = 0.8;
  const w = 0.14;
  const d = 0.45;

  useFrame((_, delta) => {
    if (glowRef.current) {
      glowRef.current.intensity = THREE.MathUtils.lerp(
        glowRef.current.intensity,
        hovered ? 2.5 : 0.6,
        delta * 5
      );
    }
  });

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
      {/* Book body */}
      <mesh position={[0, 0, hovered ? 0.18 : 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.15}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Gold edge detail */}
      <mesh position={[0, h / 2 - 0.02, hovered ? 0.18 : 0]}>
        <boxGeometry args={[w + 0.005, 0.02, d + 0.005]} />
        <meshStandardMaterial color="#c4a35a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -h / 2 + 0.02, hovered ? 0.18 : 0]}>
        <boxGeometry args={[w + 0.005, 0.02, d + 0.005]} />
        <meshStandardMaterial color="#c4a35a" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Spine text */}
      <Text
        position={[w / 2 + 0.002, 0, hovered ? 0.18 : 0]}
        rotation={[0, Math.PI / 2, Math.PI / 2]}
        fontSize={0.05}
        maxWidth={h * 0.75}
        color="#f0e6d3"
        anchorX="center"
        anchorY="middle"
      >
        {book.title}
      </Text>

      {/* Glow */}
      <pointLight
        ref={glowRef}
        position={[0, 0, 0.4]}
        intensity={0.6}
        distance={2.5}
        color={color}
      />
    </group>
  );
});
InteractiveBook.displayName = "InteractiveBook";

// ─── Library Room Architecture ───

function LibraryArchitecture() {
  const floorW = 22;
  const floorD = 24;
  const wallH = 6;
  const wallColor = "#1a120a";
  const floorColor = "#2a1a0e";
  const ceilingColor = "#0f0a06";

  return (
    <group>
      {/* Wooden floor with planks feel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3]} receiveShadow>
        <planeGeometry args={[floorW, floorD]} />
        <meshStandardMaterial color={floorColor} roughness={0.85} />
      </mesh>

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, wallH / 2, -15]} receiveShadow>
        <planeGeometry args={[floorW, wallH]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      {/* Front wall */}
      <mesh position={[0, wallH / 2, 9]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[floorW, wallH]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-11, wallH / 2, -3]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[floorD, wallH]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      {/* Right wall */}
      <mesh position={[11, wallH / 2, -3]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[floorD, wallH]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wallH, -3]}>
        <planeGeometry args={[floorW, floorD]} />
        <meshStandardMaterial color={ceilingColor} roughness={1} />
      </mesh>

      {/* Ceiling beams */}
      {[-6, -2, 2, 6].map((x) => (
        <mesh key={x} position={[x, wallH - 0.1, -3]}>
          <boxGeometry args={[0.2, 0.2, floorD]} />
          <meshStandardMaterial color="#2a1808" roughness={0.9} />
        </mesh>
      ))}

      {/* Floor runner carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -3]}>
        <planeGeometry args={[2, floorD - 2]} />
        <meshStandardMaterial color="#4a1a1a" roughness={0.95} />
      </mesh>
    </group>
  );
}

// ─── Lighting ───

function LibraryLighting() {
  return (
    <>
      <ambientLight intensity={0.08} color="#ffd4a0" />

      {/* Hanging lanterns along the center aisle */}
      {[-10, -6, -2, 2, 6].map((z) => (
        <group key={z} position={[0, 5.2, z]}>
          {/* Lantern body */}
          <mesh>
            <cylinderGeometry args={[0.12, 0.18, 0.25, 6]} />
            <meshStandardMaterial
              color="#d4a050"
              emissive="#d4a050"
              emissiveIntensity={0.3}
              transparent
              opacity={0.7}
            />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.6]} />
            <meshStandardMaterial color="#5a4a3a" metalness={0.8} />
          </mesh>
          <pointLight
            position={[0, -0.2, 0]}
            intensity={1.2}
            distance={7}
            color="#ffb347"
            castShadow
            shadow-mapSize-width={256}
            shadow-mapSize-height={256}
          />
        </group>
      ))}

      {/* Side wall sconces */}
      {[-10, -6, -2, 2, 6].map((z) =>
        [-10.5, 10.5].map((x) => (
          <pointLight
            key={`${x}-${z}`}
            position={[x, 3.5, z]}
            intensity={0.4}
            distance={5}
            color="#ff9944"
          />
        ))
      )}
    </>
  );
}

// ─── Featured Books Display (the 3 interactive ones) ───

function FeaturedShelf({ books, onSelectBook, onHoverBook }: {
  books: BookData[];
  onSelectBook: (id: string) => void;
  onHoverBook: (id: string | null) => void;
}) {
  // A special display table in the center of the library
  return (
    <group position={[0, 0, 0]}>
      {/* Display table */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[2.5, 0.06, 0.8]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
      {/* Table legs */}
      {[[-1.1, 0.22, -0.3], [-1.1, 0.22, 0.3], [1.1, 0.22, -0.3], [1.1, 0.22, 0.3]].map(
        ([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={[0.08, 0.44, 0.08]} />
            <meshStandardMaterial color="#3d2510" roughness={0.9} />
          </mesh>
        )
      )}

      {/* "Featured" sign */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color="#d4a050"
        anchorX="center"
        anchorY="middle"
      >
        ✦ FEATURED CLASSICS ✦
      </Text>
      <Text
        position={[0, 1.25, 0]}
        fontSize={0.09}
        color="#a08060"
        anchorX="center"
        anchorY="middle"
      >
        Click a book to enter its world
      </Text>

      {/* Spotlight on featured books */}
      <pointLight position={[0, 2.5, 0.5]} intensity={2} distance={4} color="#ffeedd" castShadow />

      {/* The 3 interactive books standing on the table */}
      {books.map((book, i) => (
        <InteractiveBook
          key={book.id}
          book={book}
          position={[-0.7 + i * 0.7, 0.88, 0]}
          onSelect={onSelectBook}
          onHover={onHoverBook}
        />
      ))}
    </group>
  );
}

// ─── Instructions overlay ───

function InstructionsOverlay({ locked }: { locked: boolean }) {
  if (locked) return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        pointerEvents: "none",
        zIndex: 10,
      }}
      className="text-xs text-muted-foreground/60 font-display"
    >
      WASD to move · Mouse to look · Click a glowing book · ESC to unlock
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
        background: "rgba(0,0,0,0.7)",
        cursor: "pointer",
      }}
    >
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          The Grand Library
        </h2>
        <p className="text-muted-foreground mb-4">
          Click anywhere to enter
        </p>
        <p className="text-xs text-muted-foreground/60">
          WASD / Arrow keys to move · Mouse to look around
        </p>
      </div>
    </div>
  );
}

// ─── Main Scene ───

export default function LibraryScene({ books, onSelectBook }: LibrarySceneProps) {
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  const handleHover = useCallback((id: string | null) => {
    setHoveredBook(id);
  }, []);

  const hoveredData = books.find((b) => b.id === hoveredBook);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <Canvas
        shadows
        camera={{ position: [0, 1.7, 7], fov: 65, near: 0.1, far: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.8 }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#060402"]} />
          <fog attach="fog" args={["#060402", 5, 22]} />

          <LibraryArchitecture />
          <LibraryLighting />

          {/* ═══ LEFT AISLE — Wall shelves ═══ */}
          {Array.from({ length: 6 }).map((_, i) => (
            <BookshelfUnit
              key={`lw-${i}`}
              position={[-10.4, 0, -12 + i * 4]}
              width={3.5}
              shelves={6}
              facing="front"
              seed={1000 + i * 500}
            />
          ))}

          {/* ═══ RIGHT AISLE — Wall shelves ═══ */}
          {Array.from({ length: 6 }).map((_, i) => (
            <BookshelfUnit
              key={`rw-${i}`}
              position={[10.4, 0, -12 + i * 4]}
              width={3.5}
              shelves={6}
              facing="back"
              seed={2000 + i * 500}
            />
          ))}

          {/* ═══ CENTER AISLES — Freestanding double-sided shelves ═══ */}
          {[-5, 5].map((x) =>
            Array.from({ length: 4 }).map((_, i) => (
              <group key={`ca-${x}-${i}`}>
                <BookshelfUnit
                  position={[x, 0, -10 + i * 5]}
                  width={3}
                  shelves={5}
                  facing="front"
                  seed={3000 + x * 100 + i * 500}
                />
                <BookshelfUnit
                  position={[x, 0, -10 + i * 5]}
                  width={3}
                  shelves={5}
                  facing="back"
                  seed={4000 + x * 100 + i * 500}
                />
              </group>
            ))
          )}

          {/* ═══ Back wall shelves ═══ */}
          {[-7, -3.5, 0, 3.5, 7].map((x, i) => (
            <BookshelfUnit
              key={`bw-${i}`}
              position={[x, 0, -14.4]}
              width={3}
              shelves={6}
              facing="front"
              seed={5000 + i * 500}
            />
          ))}

          {/* ═══ FEATURED DISPLAY — Center of library ═══ */}
          <FeaturedShelf
            books={books}
            onSelectBook={onSelectBook}
            onHoverBook={handleHover}
          />

          {/* Controls */}
          <PointerLockControls
            onLock={() => setLocked(true)}
            onUnlock={() => setLocked(false)}
          />
          <MovementController speed={4} />
        </Suspense>
      </Canvas>

      <InstructionsOverlay locked={locked} />

      {/* HUD for hovered book */}
      {hoveredData && locked && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
            zIndex: 15,
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
