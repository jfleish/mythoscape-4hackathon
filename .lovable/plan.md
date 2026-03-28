

## Confirmed Flow: Hardcoded Beowulf Book

### User Experience
1. User clicks **"Add Book"** button on the Library page
2. Dialog opens with three fields: **Title**, **Author**, **Scene**
3. User fills in whatever they want — all input is ignored
4. On submit, a new book is created as **"Beowulf"** by **"Anonymous"**
5. The `generate-world` edge function is called with the hardcoded Beowulf dragon image + prompt
6. The new book appears in the library with a "Generating..." state
7. Once ready, clicking the book opens the **Beowulf & dragon 360 scene**

### Implementation

#### 1. Database Migration
- Add RLS policy allowing anonymous (`anon` role) INSERT on `books` where `user_id IS NULL`

#### 2. Upload Beowulf Reference Image
- Upload one of the two Beowulf images to the `world-uploads` storage bucket
- This public URL becomes the hardcoded `imageUrl` for all generations

#### 3. UI Changes (`src/pages/Library.tsx`)
- Add floating "Add Book" button
- Dialog with 3 fields: Title, Author, Scene (all cosmetic — input is discarded)
- On submit:
  - INSERT into `books` with `title: "Beowulf"`, `author: "Anonymous"`, `user_id: null`
  - Call `generate-world` with hardcoded Beowulf image URL + prompt like *"A dramatic wide zoomed-out aerial 360 panoramic view of Beowulf battling a fire-breathing dragon in a dark mountainous cave, epic fantasy scene with flames and smoke"*
- Replace hardcoded 3-hotspot layout with a dynamic book grid so new books appear

#### 4. No Edge Function Changes
- `generate-world` already supports `sourceType: "image"` with `imageUrl` + text `prompt`

### Files Changed
| File | Change |
|------|--------|
| New migration | Anonymous INSERT RLS policy on `books` |
| `src/pages/Library.tsx` | Add Book button, dialog, hardcoded submission, dynamic grid |
| `world-uploads` bucket | Upload Beowulf reference image |

