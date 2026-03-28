

## Spread Out Book Hotspots

The current layout clusters all hotspots tightly in the center. The user wants them spread across the full width of the 3D scene so you need to "look around" the iframe to discover different books.

### Change

Update `getHotspotPositions` in `src/pages/Library.tsx` (lines 13-29):
- Use the full viewport width (5% to 95%) instead of centering in a tight cluster
- Keep hotspot width small (~12%) so they feel like discovery points scattered across the scene
- Distribute evenly across the full range with generous spacing

```typescript
function getHotspotPositions(count: number) {
  const positions = [];
  const hotspotWidth = Math.min(12, 60 / Math.max(count, 1));
  const startLeft = 5;
  const endLeft = 95 - hotspotWidth;
  const spacing = count > 1 ? (endLeft - startLeft) / (count - 1) : 0;

  for (let i = 0; i < count; i++) {
    positions.push({
      left: `${startLeft + i * spacing}%`,
      top: "30%",
      width: `${hotspotWidth}%`,
      height: "35%",
    });
  }
  return positions;
}
```

This spreads books from 5% to 95% of the screen width — users will need to pan/look around the 3D scene to find each book.

