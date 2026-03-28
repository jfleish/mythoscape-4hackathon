import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import BookWorld from "@/components/library/BookWorld";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LIBRARY_MARBLE_URL =
  "https://marble.worldlabs.ai/world/ffb39a1e-74c1-45d7-b8f9-40049a5d9d44";

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
  const [iframeLoaded, setIframeLoaded] = useState(false);

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
          <p className="text-muted-foreground font-display">
            Opening the library…
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
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
            className="w-full h-full relative"
          >
            {/* Marble 3D Library World as background */}
            <iframe
              src={LIBRARY_MARBLE_URL}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; gyroscope; xr-spatial-tracking"
              title="Library 3D World"
              onLoad={() => setIframeLoaded(true)}
            />

            {/* Loading overlay while iframe loads */}
            <AnimatePresence>
              {!iframeLoaded && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 z-20 bg-black flex items-center justify-center"
                >
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
                    <p className="text-muted-foreground font-display">
                      Entering the library…
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Book selection overlay — bottom shelf */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, type: "spring", damping: 20 }}
              className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
            >
              <div className="pointer-events-auto bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-16 pb-6 px-6">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      Featured Classics
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {books.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => setSelectedBookId(book.id)}
                        className="group text-left bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-primary/40 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-semibold text-sm text-foreground truncate">
                              {book.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {book.author}
                            </p>
                            <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                              {book.dewey_label}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0" />
                        </div>
                        {book.description && (
                          <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2">
                            {book.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
