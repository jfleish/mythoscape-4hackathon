import { create } from "zustand";
import type { BookMeta } from "@/types/book";
import { books } from "@/data/books";

type SceneType = "library" | "book";
type TransitionState = "idle" | "fading-out" | "fading-in";

interface AppState {
  currentScene: SceneType;
  selectedBook: BookMeta | null;
  transitionState: TransitionState;

  currentPassageIndex: number;
  readingPanelOpen: boolean;
  fontSize: "small" | "medium" | "large";
  darkMode: boolean;

  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;

  comingSoonOpen: boolean;

  selectBook: (bookId: string) => void;
  returnToLibrary: () => void;
  setTransitionState: (state: TransitionState) => void;
  setCurrentScene: (scene: SceneType) => void;

  nextPassage: () => void;
  prevPassage: () => void;
  goToPassage: (index: number) => void;
  toggleReadingPanel: () => void;
  setFontSize: (size: "small" | "medium" | "large") => void;
  toggleDarkMode: () => void;

  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackSpeed: (speed: number) => void;

  setComingSoonOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScene: "library",
  selectedBook: null,
  transitionState: "idle",

  currentPassageIndex: 0,
  readingPanelOpen: true,
  fontSize: "medium",
  darkMode: true,

  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  playbackSpeed: 1,

  comingSoonOpen: false,

  selectBook: (bookId: string) => {
    const book = books.find((b) => b.bookId === bookId);
    if (!book) return;
    if (!book.modelUrl) {
      set({ comingSoonOpen: true });
      return;
    }
    set({
      selectedBook: book,
      currentPassageIndex: 0,
      readingPanelOpen: true,
      transitionState: "fading-out",
    });
  },

  returnToLibrary: () => {
    set({
      transitionState: "fading-out",
      isPlaying: false,
    });
  },

  setTransitionState: (transitionState) => set({ transitionState }),

  setCurrentScene: (currentScene) => {
    if (currentScene === "library") {
      set({ currentScene, selectedBook: null });
    } else {
      set({ currentScene });
    }
  },

  nextPassage: () => {
    const { selectedBook, currentPassageIndex } = get();
    if (!selectedBook) return;
    if (currentPassageIndex < selectedBook.passages.length - 1) {
      set({ currentPassageIndex: currentPassageIndex + 1 });
    }
  },

  prevPassage: () => {
    const { currentPassageIndex } = get();
    if (currentPassageIndex > 0) {
      set({ currentPassageIndex: currentPassageIndex - 1 });
    }
  },

  goToPassage: (index) => set({ currentPassageIndex: index }),

  toggleReadingPanel: () =>
    set((s) => ({ readingPanelOpen: !s.readingPanelOpen })),

  setFontSize: (fontSize) => set({ fontSize }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

  setComingSoonOpen: (comingSoonOpen) => set({ comingSoonOpen }),
}));
