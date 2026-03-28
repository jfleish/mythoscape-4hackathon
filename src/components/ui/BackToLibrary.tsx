"use client";

import { useAppStore } from "@/stores/useAppStore";

export function BackToLibrary() {
  const returnToLibrary = useAppStore((s) => s.returnToLibrary);
  const transitionState = useAppStore((s) => s.transitionState);

  return (
    <button
      onClick={returnToLibrary}
      disabled={transitionState !== "idle"}
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: 8,
        color: "#e0d5c0",
        fontSize: 14,
        cursor: "pointer",
        transition: "background 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
        e.currentTarget.style.transform = "scale(1.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(0, 0, 0, 0.6)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <span style={{ fontSize: 18 }}>&larr;</span>
      Back to Library
    </button>
  );
}
