"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

// --- Shared UI Primitives ---

export function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
      <p className="text-slate-500 font-medium mt-1">{description}</p>
    </div>
  );
}

export function SettingsCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 ${className ?? ""}`}>
      {children}
    </div>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{children}</label>;
}

export function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm font-medium text-slate-800"
    />
  );
}

export function Toggle({ enabled, onChange, label, description }: {
  enabled: boolean; onChange: (v: boolean) => void; label: string; description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-bold text-slate-800 text-sm">{label}</div>
        {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${enabled ? "bg-purple-500 shadow-md shadow-purple-200" : "bg-slate-200"}`}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}

export function SaveButton({ onSave, label = "Save Changes" }: { onSave: () => void; label?: string }) {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(false);

  const handleSave = () => {
    onSave();
    setSaved(true);
    setToast(true);
    setTimeout(() => { setSaved(false); setToast(false); }, 3000);
  };

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-slate-800/95 backdrop-blur-md text-white rounded-full shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="font-bold text-sm">Settings saved successfully! ✨</span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={handleSave}
        whileTap={{ scale: 0.97 }}
        className={`px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
          saved
            ? "bg-green-500 text-white shadow-green-200"
            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-200 hover:shadow-purple-300 hover:from-purple-700 hover:to-pink-700"
        }`}
      >
        {saved ? "✓ Saved!" : label}
      </motion.button>
    </>
  );
}
