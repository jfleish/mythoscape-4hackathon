

## Generate Beowulf 360 World from Reference Images

### What We'll Do

1. **Combine the two uploaded reference images** into a single composite image using the AI image editing capability — placing them side by side to give the World Labs API a richer reference of the dragon battle scene
2. **Upload the composite image** to the `world-uploads` storage bucket
3. **Trigger the `generate-world` edge function** with the uploaded image URL and a detailed panoramic prompt
4. **Once generation succeeds**, hardcode the resulting `world_marble_url` into `AddBookDialog.tsx` so future "Add Book" actions skip generation entirely and load the pre-built world instantly

### Technical Steps

**Step 1 — Create composite image**
- Copy both uploaded images to `/tmp/`
- Use Python (PIL/Pillow) to combine them side-by-side into a single reference image
- Save to `/tmp/beowulf-combined.jpg`

**Step 2 — Upload to storage**
- Upload the composite to the `world-uploads` bucket via the Supabase storage API
- Get the public URL

**Step 3 — Trigger generation**
- Call the `generate-world` edge function with:
  - `sourceType: "image"`
  - `imageUrl`: the public URL from storage
  - `prompt`: "A dramatic wide zoomed-out aerial 360 panoramic view of Beowulf battling a fire-breathing dragon in a dark mountainous cave, epic fantasy scene with flames and smoke, ancient Norse mythology"
  - `model`: "Marble 0.1-mini"
  - No `bookId` — we just want the world URL back

**Step 4 — Hardcode the result**
- Once the world generates successfully, update `AddBookDialog.tsx` to skip calling `generate-world` entirely
- Instead, insert the book row with the `world_marble_url` pre-populated
- This makes "Add Book" instant — no waiting for generation

