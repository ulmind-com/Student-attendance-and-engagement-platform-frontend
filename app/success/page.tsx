"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Fire confetti on load
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 font-outfit overflow-hidden relative">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="glass-card w-full max-w-md text-center space-y-8 relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-32 h-32 bg-green-100 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-green-200/50"
        >
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </motion.div>

        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Awesome!</h1>
          <p className="text-xl text-slate-600 font-inter">Your attendance is marked.</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/")}
          className="flex items-center justify-center space-x-2 px-8 py-4 bg-slate-800 text-white rounded-full font-bold w-full mx-auto shadow-xl"
        >
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </motion.button>
      </motion.div>
    </main>
  );
}
