import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import { Sparkles, Globe, Wand2, ArrowRight } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Hero background */}
      <div className="absolute inset-0 pointer-events-none">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 px-6 max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
          <span className="gradient-text">Mind to Manifest</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Transform your imagination into immersive 3D worlds. Describe it, see it, refine it — all powered by AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button variant="glow" size="lg" className="gap-2" onClick={() => navigate("/auth")}>
            <Wand2 className="w-5 h-5" />
            Start Creating
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-8">
          {[
            { icon: Wand2, title: "Text to World", desc: "Describe any scene" },
            { icon: Globe, title: "Image to World", desc: "Upload and transform" },
            { icon: Sparkles, title: "AI Refinement", desc: "Chat to iterate" },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="glass-card p-4 text-center"
            >
              <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-display font-semibold text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
