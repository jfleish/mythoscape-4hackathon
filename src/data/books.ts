import type { BookMeta } from "@/types/book";
import { journeyToTheWestPassages } from "./passages/journey-to-the-west";
import { iliadPassages } from "./passages/iliad";

export const books: BookMeta[] = [
  {
    bookId: "journey-to-the-west",
    title: "Journey to the West",
    author: "Wu Cheng'en",
    coverImageUrl: "/images/cover-journey-west.jpg",
    description:
      "The legendary tale of the Monkey King, born from a stone egg, who gains supernatural powers and embarks on a perilous pilgrimage to retrieve sacred Buddhist texts.",
    modelUrl: "/models/monkey_king.glb",
    spineColor: "#8B0000",
    passages: journeyToTheWestPassages,
    cameraSpawn: {
      position: [-2, 2, -10],
      target: [3, 1, -18],
    },
    cameraOrbit: {
      center: [-2, 0, -15],
      radiusX: 8,
      radiusZ: 8,
      heightBase: 2,
      heightAmp: 1,
      speed: 0.02,
    },
  },
  {
    bookId: "iliad",
    title: "The Iliad",
    author: "Homer",
    coverImageUrl: "/images/cover-iliad.jpg",
    description:
      "The ancient Greek epic of the Trojan War, telling of the wrath of Achilles, the fall of heroes, and the clash between mortals and gods.",
    modelUrl: "/models/iliad.glb",
    spineColor: "#1a3a5c",
    passages: iliadPassages,
    cameraSpawn: {
      position: [0, 2, 3],
      target: [0, 1, 0],
    },
    cameraOrbit: {
      center: [0, 0, 0],
      radiusX: 3,
      radiusZ: 2.5,
      heightBase: 2,
      heightAmp: 0.3,
      speed: 0.03,
    },
  },
  {
    bookId: "dream-of-the-red-chamber",
    title: "Dream of the Red Chamber",
    author: "Cao Xueqin",
    coverImageUrl: "/images/cover-dream-red.jpg",
    description:
      "A masterpiece of Chinese literature following the rise and decline of the Jia family, weaving together romance, tragedy, and the nature of human attachment.",
    modelUrl: null,
    spineColor: "#6b0f1a",
    passages: [],
    cameraSpawn: {
      position: [0, 2, 5],
      target: [0, 0, 0],
    },
  },
];
