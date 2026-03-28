"use client";

import { useProgress, Html } from "@react-three/drei";

export function LoadingScreen() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          color: "#e0d5c0",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 18, letterSpacing: 2 }}>
          Entering the world...
        </div>
        <div
          style={{
            width: 200,
            height: 4,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 2,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#c9a96e",
              borderRadius: 2,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>
          {Math.round(progress)}%
        </div>
      </div>
    </Html>
  );
}
