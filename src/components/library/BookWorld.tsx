import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, X, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Passage {
  id: number;
  title: string;
  text: string;
}

interface BookWorldProps {
  book: {
    id: string;
    title: string;
    author: string;
    world_marble_url: string | null;
    pano_url: string | null;
    thumbnail_url: string | null;
    passages: Passage[];
    audio_url: string | null;
  };
  onBack: () => void;
}

export default function BookWorld({ book, onBack }: BookWorldProps) {
  const [currentPassage, setCurrentPassage] = useState(0);
  const [showReader, setShowReader] = useState(true);
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setEntering(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const passages = book.passages || [];
  const passage = passages[currentPassage];

  const hasMarbleUrl = !!book.world_marble_url;
  const hasPano = !!book.pano_url;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Transition overlay */}
      <AnimatePresence>
        {entering && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 z-50 bg-background flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="font-display text-2xl font-bold text-foreground">
                Entering {book.title}…
              </h2>
              <p className="text-muted-foreground text-sm mt-2">by {book.author}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* World viewer - Marble iframe or fallback */}
      <div className="absolute inset-0">
        {hasMarbleUrl ? (
          <iframe
            src={book.world_marble_url!}
            className="w-full h-full border-0"
            allow="accelerometer; gyroscope; xr-spatial-tracking"
            title={`${book.title} world`}
          />
        ) : hasPano ? (
          <img
            src={book.pano_url!}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-card to-background flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                World not yet generated
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                The 3D world for this book is being created…
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute top-4 left-4 z-30"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="gap-2 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Button>
      </motion.div>

      {/* Toggle reader button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute top-4 right-4 z-30"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowReader(!showReader)}
          className="bg-background/80 backdrop-blur-sm border-border/50"
        >
          {showReader ? <X className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
        </Button>
      </motion.div>

      {/* Reading panel */}
      <AnimatePresence>
        {showReader && passages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute bottom-0 left-0 right-0 z-20 p-4"
          >
            <div className="max-w-2xl mx-auto glass-card p-6 rounded-t-2xl rounded-b-lg">
              {/* Passage header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-display font-semibold text-sm text-primary">
                    {passage?.title || `Passage ${currentPassage + 1}`}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {currentPassage + 1} of {passages.length}
                  </p>
                </div>
              </div>

              {/* Passage text */}
              <div className="max-h-40 overflow-y-auto mb-4 pr-2 scrollbar-thin">
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {passage?.text}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPassage(Math.max(0, currentPassage - 1))}
                  disabled={currentPassage === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex gap-1">
                  {passages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPassage(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentPassage
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentPassage(Math.min(passages.length - 1, currentPassage + 1))
                  }
                  disabled={currentPassage === passages.length - 1}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
