"use client";

import { useAppStore } from "@/stores/useAppStore";

export function ComingSoonModal() {
  const open = useAppStore((s) => s.comingSoonOpen);
  const setOpen = useAppStore((s) => s.setComingSoonOpen);

  if (!open) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        zIndex: 200,
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          background: "rgba(30, 24, 16, 0.95)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: "40px 48px",
          textAlign: "center",
          color: "#e0d5c0",
          maxWidth: 360,
          backdropFilter: "blur(12px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 24, marginBottom: 12, fontWeight: 600 }}>
          Coming Soon
        </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(200,185,160,0.7)",
            marginBottom: 24,
          }}
        >
          This book's world is still being crafted. Check back soon to explore
          its story.
        </div>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "rgba(201,169,110,0.2)",
            border: "1px solid rgba(201,169,110,0.4)",
            borderRadius: 6,
            color: "#c9a96e",
            padding: "10px 28px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Return to Library
        </button>
      </div>
    </div>
  );
}
