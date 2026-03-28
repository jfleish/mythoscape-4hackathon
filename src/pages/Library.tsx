import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import LibraryScene from "@/components/library/LibraryScene";
import BookWorld from "@/components/library/BookWorld";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Passage {
  id: number;
  title: string;
  text: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  dewey_label: string;
  world_marble_url: string | null;
  pano_url: string | null;
  thumbnail_url: string | null;
  passages: Passage[];
  audio_url: string | null;
}

export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("is_active", true);

      if (!error && data) {
        setBooks(
          data.map((b: any) => ({
            ...b,
            passages: Array.isArray(b.passages) ? b.passages : [],
          }))
        );
      }
      setLoading(false);
    };
    fetchBooks();
  }, []);

  const selectedBook = books.find((b) => b.id === selectedBookId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
          <p className="text-muted-foreground font-display">Opening the library…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {selectedBook ? (
          <motion.div
            key="book-world"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <BookWorld
              book={selectedBook}
              onBack={() => setSelectedBookId(null)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="library"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <LibraryScene
              books={books}
              onSelectBook={setSelectedBookId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
