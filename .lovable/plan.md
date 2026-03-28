

## Add Audio Narration to Book Worlds

### Steps

1. **Create `book-audio` storage bucket** — public bucket via SQL migration
2. **Upload 3 MP3 files** to the bucket:
   - `bhagavad-gita.mp3` → Bhagavad Gita
   - `iliad.mp3` → The Iliad
   - `monkey-king.mp3` → Journey to the West
3. **Update `audio_url`** for each book record in the database
4. **Update `BookWorld.tsx`** — Add play/pause audio overlay button:
   - `useRef<HTMLAudioElement>` + `useState<boolean>` for play state
   - Bottom-right play/pause button matching existing back button style
   - Pause + cleanup on unmount
   - Only show when `book.audio_url` exists

### UI

```text
┌──────────────────────────────────┐
│ [← Back to Library]             │
│                                 │
│       360° World View           │
│                                 │
│                                 │
│                        [▶ Play] │
└──────────────────────────────────┘
```

### File changes
- `supabase/migrations/` — create `book-audio` bucket + RLS
- `src/components/library/BookWorld.tsx` — add audio player with play/pause button

