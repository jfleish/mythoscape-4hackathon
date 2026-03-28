"use client";

import { MainCanvas } from "./MainCanvas";
import { TransitionOverlay } from "./ui/TransitionOverlay";
import { ReadingPanel } from "./ui/ReadingPanel";
import { AudioPlayer } from "./ui/AudioPlayer";
import { BackToLibrary } from "./ui/BackToLibrary";
import { ComingSoonModal } from "./ui/ComingSoonModal";
import { useAppStore } from "@/stores/useAppStore";

export default function ClientApp() {
  const currentScene = useAppStore((s) => s.currentScene);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <MainCanvas />
      <TransitionOverlay />
      {currentScene === "book" && (
        <>
          <BackToLibrary />
          <ReadingPanel />
          <AudioPlayer />
        </>
      )}
      <ComingSoonModal />
    </div>
  );
}
