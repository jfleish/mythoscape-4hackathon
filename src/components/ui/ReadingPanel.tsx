"use client";

import { useAppStore } from "@/stores/useAppStore";

const fontSizeMap = { small: 14, medium: 16, large: 20 };

export function ReadingPanel() {
  const selectedBook = useAppStore((s) => s.selectedBook);
  const currentPassageIndex = useAppStore((s) => s.currentPassageIndex);
  const readingPanelOpen = useAppStore((s) => s.readingPanelOpen);
  const fontSize = useAppStore((s) => s.fontSize);
  const darkMode = useAppStore((s) => s.darkMode);
  const toggleReadingPanel = useAppStore((s) => s.toggleReadingPanel);
  const setFontSize = useAppStore((s) => s.setFontSize);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const nextPassage = useAppStore((s) => s.nextPassage);
  const prevPassage = useAppStore((s) => s.prevPassage);

  if (!selectedBook) return null;

  const passage = selectedBook.passages[currentPassageIndex];
  if (!passage) return null;

  const bg = darkMode ? "rgba(15, 12, 8, 0.88)" : "rgba(255, 250, 240, 0.92)";
  const textColor = darkMode ? "#e0d5c0" : "#2a2218";
  const mutedColor = darkMode ? "rgba(200,185,160,0.5)" : "rgba(60,50,35,0.5)";
  const borderColor = darkMode
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.1)";

  return (
    <>
      {/* Toggle tab */}
      <button
        onClick={toggleReadingPanel}
        style={{
          position: "absolute",
          top: "50%",
          right: readingPanelOpen ? 380 : 0,
          transform: "translateY(-50%)",
          zIndex: 51,
          padding: "12px 6px",
          background: bg,
          border: `1px solid ${borderColor}`,
          borderRight: readingPanelOpen ? "none" : undefined,
          borderLeft: readingPanelOpen ? undefined : "none",
          borderRadius: readingPanelOpen ? "6px 0 0 6px" : "0 6px 6px 0",
          color: textColor,
          cursor: "pointer",
          fontSize: 16,
          backdropFilter: "blur(8px)",
          transition: "right 0.3s ease",
        }}
      >
        {readingPanelOpen ? "\u203A" : "\u2039"}
      </button>

      {/* Panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: readingPanelOpen ? 0 : -380,
          width: 380,
          height: "100%",
          background: bg,
          backdropFilter: "blur(12px)",
          borderLeft: `1px solid ${borderColor}`,
          color: textColor,
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          transition: "right 0.3s ease",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 12px",
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: mutedColor, marginBottom: 4 }}>
            {selectedBook.title}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{passage.title}</div>
          <div style={{ fontSize: 12, color: mutedColor, marginTop: 4 }}>
            Passage {currentPassageIndex + 1} of {selectedBook.passages.length}
          </div>
        </div>

        {/* Controls bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 24px",
            borderBottom: `1px solid ${borderColor}`,
            fontSize: 12,
          }}
        >
          <button
            onClick={() => setFontSize("small")}
            style={fontBtnStyle(fontSize === "small", textColor)}
          >
            A-
          </button>
          <button
            onClick={() => setFontSize("medium")}
            style={fontBtnStyle(fontSize === "medium", textColor)}
          >
            A
          </button>
          <button
            onClick={() => setFontSize("large")}
            style={fontBtnStyle(fontSize === "large", textColor)}
          >
            A+
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={toggleDarkMode}
            style={{
              background: "none",
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
              color: textColor,
              padding: "4px 10px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>

        {/* Text body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            fontSize: fontSizeMap[fontSize],
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
          }}
        >
          {passage.originalText && (
            <>
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: mutedColor,
                  marginBottom: 8,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {passage.originalLabel || "Original"}
              </div>
              <div
                style={{
                  fontSize: fontSizeMap[fontSize] - 1,
                  lineHeight: 1.9,
                  marginBottom: 24,
                  paddingBottom: 20,
                  borderBottom: `1px solid ${borderColor}`,
                  fontStyle: "italic",
                  opacity: 0.85,
                }}
              >
                {passage.originalText}
              </div>
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: mutedColor,
                  marginBottom: 8,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                English
              </div>
            </>
          )}
          {passage.text}
        </div>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 24px",
            borderTop: `1px solid ${borderColor}`,
          }}
        >
          <button
            onClick={prevPassage}
            disabled={currentPassageIndex === 0}
            style={navBtnStyle(currentPassageIndex === 0, textColor)}
          >
            &larr; Previous
          </button>
          <button
            onClick={nextPassage}
            disabled={currentPassageIndex >= selectedBook.passages.length - 1}
            style={navBtnStyle(
              currentPassageIndex >= selectedBook.passages.length - 1,
              textColor
            )}
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </>
  );
}

function fontBtnStyle(active: boolean, color: string): React.CSSProperties {
  return {
    background: active ? "rgba(128,128,128,0.3)" : "none",
    border: "1px solid rgba(128,128,128,0.2)",
    borderRadius: 4,
    color,
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: active ? 700 : 400,
  };
}

function navBtnStyle(disabled: boolean, color: string): React.CSSProperties {
  return {
    background: "none",
    border: "none",
    color: disabled ? "rgba(128,128,128,0.3)" : color,
    cursor: disabled ? "default" : "pointer",
    fontSize: 14,
    padding: "8px 0",
    fontFamily: "system-ui, sans-serif",
  };
}
