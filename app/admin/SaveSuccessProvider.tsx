"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";

interface SaveSuccessContextType {
  showSaveSuccess: (message?: string) => void;
}

const SaveSuccessContext = createContext<SaveSuccessContextType>({
  showSaveSuccess: () => {},
});

export function useSaveSuccess() {
  return useContext(SaveSuccessContext);
}

export function SaveSuccessProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("Saved Successfully!");
  const [animationData, setAnimationData] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/lottie/Done.json")
      .then((r) => r.json())
      .then((d) => setAnimationData(d))
      .catch(console.error);
  }, []);

  const showSaveSuccess = useCallback((msg = "Saved Successfully!") => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 2000);
  }, []);

  return (
    <SaveSuccessContext.Provider value={{ showSaveSuccess }}>
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center justify-center">
              {animationData && (
                <Lottie
                  animationData={animationData}
                  loop={false}
                  autoplay={true}
                  style={{ background: "transparent" }}
                  className="w-36 h-36 drop-shadow-2xl"
                />
              )}
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-2 text-base font-black bg-gradient-to-r from-green-500 to-teal-500 text-transparent bg-clip-text"
              >
                {message}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SaveSuccessContext.Provider>
  );
}
