"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";

export function TransitionOverlay() {
  const transitionState = useAppStore((s) => s.transitionState);
  const currentScene = useAppStore((s) => s.currentScene);
  const setTransitionState = useAppStore((s) => s.setTransitionState);
  const setCurrentScene = useAppStore((s) => s.setCurrentScene);

  useEffect(() => {
    if (transitionState === "fading-out") {
      const timer = setTimeout(() => {
        // Swap the scene at the peak of the fade
        setCurrentScene(currentScene === "library" ? "book" : "library");
        setTransitionState("fading-in");
      }, 600);
      return () => clearTimeout(timer);
    }
    if (transitionState === "fading-in") {
      const timer = setTimeout(() => {
        setTransitionState("idle");
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [transitionState, currentScene, setCurrentScene, setTransitionState]);

  const isVisible = transitionState !== "idle";
  const opacity = transitionState === "fading-out" ? 1 : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#000",
        opacity,
        transition: "opacity 0.6s ease-in-out",
        pointerEvents: isVisible ? "all" : "none",
        zIndex: 100,
      }}
    />
  );
}
