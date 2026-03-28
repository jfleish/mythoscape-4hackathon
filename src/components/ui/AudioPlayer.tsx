"use client";

import { useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/stores/useAppStore";

const SPEEDS = [0.75, 1, 1.25, 1.5];

export function AudioPlayer() {
  const selectedBook = useAppStore((s) => s.selectedBook);
  const currentPassageIndex = useAppStore((s) => s.currentPassageIndex);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const currentTime = useAppStore((s) => s.currentTime);
  const duration = useAppStore((s) => s.duration);
  const volume = useAppStore((s) => s.volume);
  const playbackSpeed = useAppStore((s) => s.playbackSpeed);
  const setIsPlaying = useAppStore((s) => s.setIsPlaying);
  const setCurrentTime = useAppStore((s) => s.setCurrentTime);
  const setDuration = useAppStore((s) => s.setDuration);
  const setVolume = useAppStore((s) => s.setVolume);
  const setPlaybackSpeed = useAppStore((s) => s.setPlaybackSpeed);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const passage = selectedBook?.passages[currentPassageIndex];
  const audioUrl = passage?.audioUrl;

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) {
      audioRef.current = null;
      return;
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.volume = volume;
    audio.playbackRate = playbackSpeed;

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("ended", () => setIsPlaying(false));

    // Autoplay when audio is ready
    audio.addEventListener("canplaythrough", () => {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }, { once: true });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying, setIsPlaying]);

  const seek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      if (audioRef.current) audioRef.current.currentTime = time;
      setCurrentTime(time);
    },
    [setCurrentTime]
  );

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // No audio available -- show placeholder
  if (!audioUrl) {
    return (
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 380,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "14px 24px",
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(200,185,160,0.5)",
          fontSize: 13,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Audio narration coming soon
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 380,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 24px",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        color: "#e0d5c0",
        fontFamily: "system-ui, sans-serif",
        fontSize: 13,
      }}
    >
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        style={{
          background: "none",
          border: "none",
          color: "#e0d5c0",
          fontSize: 20,
          cursor: "pointer",
          padding: 4,
        }}
      >
        {isPlaying ? "\u23F8" : "\u25B6"}
      </button>

      {/* Time */}
      <span style={{ fontSize: 12, minWidth: 40 }}>
        {formatTime(currentTime)}
      </span>

      {/* Seek bar */}
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={currentTime}
        onChange={seek}
        style={{ flex: 1, accentColor: "#c9a96e" }}
      />

      <span style={{ fontSize: 12, minWidth: 40 }}>
        {formatTime(duration)}
      </span>

      {/* Volume */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        style={{ width: 80, accentColor: "#c9a96e" }}
      />

      {/* Speed */}
      <button
        onClick={() => {
          const idx = SPEEDS.indexOf(playbackSpeed);
          setPlaybackSpeed(SPEEDS[(idx + 1) % SPEEDS.length]);
        }}
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 4,
          color: "#e0d5c0",
          padding: "4px 10px",
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        {playbackSpeed}x
      </button>
    </div>
  );
}
