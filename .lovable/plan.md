

## Remove Reading Panel from BookWorld

Remove the entire reading/passage panel overlay from `BookWorld.tsx` — the bottom text box that shows passage titles, text, and navigation dots.

### Change

In `src/components/library/BookWorld.tsx`:
- Delete the reading panel `AnimatePresence` block (lines ~133–189) that renders passages
- Remove the toggle reader button (top-right corner, lines ~118–130)
- Remove related state: `showReader`, `currentPassage`
- Remove unused imports: `ChevronLeft`, `ChevronRight`, `BookOpen` (if not used elsewhere in the file), `Volume2`, `VolumeX`, `Play`, `Pause`
- Remove the `Passage` interface and `passages`/`passage` variables

This keeps the 3D world iframe, the enter transition, and the back button intact.

