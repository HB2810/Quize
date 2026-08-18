"use client";

import {
  Trophy, Shield, Compass, Lightbulb, Ban, Star, Leaf, HelpCircle, Hash, CheckCircle,
  Armchair, Sun, AlertTriangle, Footprints, Moon, Droplet, Coffee, Cloud, Wind,
  Activity, Stethoscope, Brain, Sparkles, User, Dumbbell, RotateCw, Zap
} from "lucide-react";
import { motion } from "motion/react";

export function CreativeIcon({ emoji, className }: { emoji: string; className?: string }) {
  const cleanEmoji = emoji.replace(/[\uFE0F\uE000-\uF8FF]|\uD83C[\uDFFB-\uDFFF]/g, "").trim();

  switch (cleanEmoji) {
    case "🏆":
      return (
        <motion.span className="inline-block" animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <Trophy className={className} />
        </motion.span>
      );
    case "🛡️":
    case "🛡":
      return (
        <motion.span className="inline-block" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          <Shield className={className} />
        </motion.span>
      );
    case "🧭":
      return (
        <motion.span className="inline-block" animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}>
          <Compass className={className} />
        </motion.span>
      );
    case "💡":
      return (
        <motion.span className="inline-block" animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Lightbulb className={className} />
        </motion.span>
      );
    case "🚫":
      return <Ban className={className} />;
    case "⭐":
      return (
        <motion.span className="inline-block" animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <Star className={className} />
        </motion.span>
      );
    case "🌿":
      return (
        <motion.span className="inline-block" style={{ transformOrigin: "bottom center" }} animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <Leaf className={className} />
        </motion.span>
      );
    case "🎈":
      return (
        <motion.span className="inline-block" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          <Sparkles className={className} />
        </motion.span>
      );
    case "🧠":
      return (
        <motion.span className="inline-block" animate={{ scale: [0.95, 1.05, 0.95] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <Brain className={className} />
        </motion.span>
      );
    case "🩺":
      return <Stethoscope className={className} />;
    case "🏥":
      return <Activity className={className} />;
    case "👨":
    case "👩":
    case "🧑":
      return <User className={className} />;
    case "🔢":
      return <Hash className={className} />;
    case "✅":
      return <CheckCircle className={className} />;
    case "🤔":
      return <HelpCircle className={className} />;
    case "🪑":
    case "🛋️":
    case "🛋":
      return <Armchair className={className} />;
    case "🧘":
    case "💻":
      return <Activity className={className} />;
    case "🙇":
      return <User className={className} />;
    case "🏋️":
    case "🏋":
      return (
        <motion.span className="inline-block" animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
          <Dumbbell className={className} />
        </motion.span>
      );
    case "🔄":
      return (
        <motion.span className="inline-block" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
          <RotateCw className={className} />
        </motion.span>
      );
    case "💪":
      return (
        <motion.span className="inline-block" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
          <Zap className={className} />
        </motion.span>
      );
    case "🌅":
      return (
        <motion.span className="inline-block" animate={{ rotate: 45 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
          <Sun className={className} />
        </motion.span>
      );
    case "⚠️":
      return (
        <motion.span className="inline-block" animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
          <AlertTriangle className={className} />
        </motion.span>
      );
    case "🚶":
      return (
        <motion.span className="inline-block" animate={{ x: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <Footprints className={className} />
        </motion.span>
      );
    case "😴":
    case "🛏️":
    case "🛏":
    case "🛌":
      return <Moon className={className} />;
    case "🥛":
      return <Droplet className={className} />;
    case "🍬":
      return <Zap className={className} />;
    case "☕":
      return <Coffee className={className} />;
    case "🍊":
      return <Sun className={className} />;
    case "☁️":
      return <Cloud className={className} />;
    case "👵":
      return <User className={className} />;
    case "🚬":
      return <Wind className={className} />;
    case "💧":
      return <Droplet className={className} />;
    case "🥗":
      return <Leaf className={className} />;

    default:
      return <span className="inline-block">{emoji}</span>;
  }
}
