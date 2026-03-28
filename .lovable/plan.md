

## Make Added Books Ephemeral (Session-Only)

Books added via "Add Book" should disappear when navigating back from their 360 world, so users must re-add them each time.

### Approach

Track which book IDs were added during the current session in React state. When the user clicks "Back to Library" from one of those books, delete it from the database so it no longer appears.

### Changes

**`src/pages/Library.tsx`:**
1. Add a `sessionBookIds` state (`Set<string>`) to track books added via the dialog
2. Pass a callback from `AddBookDialog` that registers the new book ID into `sessionBookIds`
3. In the `onBack` handler for `BookWorld`, check if the book was a session book — if so, delete it from the `books` table (`supabase.from("books").delete().eq("id", id)`) and remove it from local state
4. Pass the modified `onBack` to `BookWorld`

**`src/components/library/AddBookDialog.tsx`:**
1. Add an `onBookIdCreated?: (id: string) => void` prop
2. After inserting, call `onBookIdCreated(book.id)` so the parent can track it

No database schema changes needed — we just delete the row on back-navigation.

