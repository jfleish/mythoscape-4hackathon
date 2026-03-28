import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookWorldProps {
  book: {
    id: string;
    title: string;
    author: string;
    world_marble_url: string | null;
    pano_url: string | null;
    thumbnail_url: string | null;
    audio_url: string | null;
  };
  onBack: () => void;
}

export default function BookWorld({ book, onBack }: BookWorldProps) {
  const [entering, setEntering] = useState(true);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setEntering(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const hasMarbleUrl = !!book.world_marble_url;
  const hasPano = !!book.pano_url;
  const hasAudio = !!book.audio_url;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Audio element */}
      {hasAudio && (
        <audio
          ref={audioRef}
          src={book.audio_url!}
          onEnded={() => setPlaying(false)}
          preload="auto"
        />
      )}

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

      {/* World viewer */}
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
              <p className="text-muted-foreground">World not yet generated</p>
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

      {/* Audio play/pause button */}
      {hasAudio && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-6 right-6 z-30"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlay}
            className="gap-2 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
          >
            {playing ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {playing ? "Pause Narration" : "Play Narration"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
