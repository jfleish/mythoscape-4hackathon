import { motion } from "framer-motion";
import { Globe, Loader2 } from "lucide-react";

interface WorldViewerProps {
  sceneUrl: string | null;
  status: string;
  prompt: string;
}

const WorldViewer = ({ sceneUrl, status, prompt }: WorldViewerProps) => {
  if (status === "pending" || status === "processing") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Globe className="w-16 h-16 text-primary" />
        </motion.div>
        <div className="text-center">
          <p className="text-foreground font-display font-medium">Manifesting your world…</p>
          <p className="text-sm text-muted-foreground mt-1">"{prompt}"</p>
        </div>
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (sceneUrl) {
    return (
      <iframe
        src={sceneUrl}
        className="w-full h-full border-0 rounded-lg"
        allow="xr-spatial-tracking; gyroscope; accelerometer"
        allowFullScreen
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
      <Globe className="w-20 h-20 animate-float opacity-30" />
      <p className="font-display">Your world will appear here</p>
    </div>
  );
};

export default WorldViewer;
