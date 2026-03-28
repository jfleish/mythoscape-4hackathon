"use client";

import { LibraryRoom } from "./LibraryRoom";
import { Bookshelf } from "./Bookshelf";
import { BookModel } from "./BookModel";
import { LibraryCamera } from "./LibraryCamera";
import { books } from "@/data/books";
import { Text } from "@react-three/drei";

export function LibraryScene() {
  return (
    <group>
      <LibraryRoom />
      <LibraryCamera />

      {/* Center bookshelf against back wall */}
      <Bookshelf position={[0, 0, -4.5]} width={4} shelves={4} />

      {/* Left bookshelf */}
      <Bookshelf
        position={[-5.5, 0, -1]}
        rotation={[0, Math.PI / 2, 0]}
        width={3}
        shelves={4}
      />

      {/* Right bookshelf */}
      <Bookshelf
        position={[5.5, 0, -1]}
        rotation={[0, -Math.PI / 2, 0]}
        width={3}
        shelves={4}
      />

      {/* Featured books on the center shelf, second shelf from bottom */}
      {books.map((book, i) => (
        <BookModel
          key={book.bookId}
          book={book}
          position={[-0.5 + i * 0.5, 1.1, -4.3]}
        />
      ))}

      {/* Book title labels floating above each book */}
      {books.map((book, i) => (
        <Text
          key={`label-${book.bookId}`}
          position={[-0.5 + i * 0.5, 1.45, -4.3]}
          fontSize={0.08}
          color="#e0d5c0"
          anchorX="center"
          anchorY="bottom"
          maxWidth={0.6}
          textAlign="center"
          font={undefined}
        >
          {book.title}
        </Text>
      ))}

      {/* Decorative filler books on shelves */}
      <FillerBooks shelfY={0.22} z={-4.3} count={8} />
      <FillerBooks shelfY={1.85} z={-4.3} count={10} />
      <FillerBooks shelfY={2.62} z={-4.3} count={9} />

      {/* Welcome text */}
      <Text
        position={[0, 3.8, -4.4]}
        fontSize={0.25}
        color="#c9a96e"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        Classic Worlds
      </Text>
      <Text
        position={[0, 3.45, -4.4]}
        fontSize={0.1}
        color="#a08860"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        Select a book to enter its world
      </Text>
    </group>
  );
}

function FillerBooks({
  shelfY,
  z,
  count,
}: {
  shelfY: number;
  z: number;
  count: number;
}) {
  const colors = [
    "#2d4a3e",
    "#4a3040",
    "#3a3a5a",
    "#5a4030",
    "#2a4050",
    "#504030",
    "#3a5040",
    "#504050",
    "#605030",
    "#305040",
  ];

  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const x = -1.5 + i * 0.3 + Math.random() * 0.05;
        const h = 0.18 + Math.random() * 0.08;
        const w = 0.03 + Math.random() * 0.02;
        return (
          <mesh key={i} position={[x, shelfY + h / 2, z]} castShadow>
            <boxGeometry args={[w, h, 0.12]} />
            <meshStandardMaterial
              color={colors[i % colors.length]}
              roughness={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}
