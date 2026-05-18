"use client";
import { useState, useEffect } from "react";
import { SectionHeader, SettingsCard, SaveButton } from "./shared";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function BrandingPanel() {
  const [activeTab, setActiveTab] = useState<"clock" | "puzzle">("clock");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [clockColors, setClockColors] = useState<Record<string, string>>({});
  const [puzzleColors, setPuzzleColors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/colors?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setClockColors(data.clock_emotions || {});
        setPuzzleColors(data.puzzle_emotions || {});
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/colors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clock_emotions: clockColors,
          puzzle_emotions: puzzleColors,
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const updateClockColor = (level: string, color: string) => {
    setClockColors(prev => ({ ...prev, [level]: color }));
  };

  const updatePuzzleColor = (emotion: string, color: string) => {
    setPuzzleColors(prev => ({ ...prev, [emotion]: color }));
  };

  const clockLabels: Record<string, string> = {
    "1": "Very Bad", "2": "Sad", "3": "Low Energy", "4": "Hurt", "5": "Okay",
    "6": "Calm", "7": "Happy", "8": "Great", "9": "Amazing", "10": "Excellent"
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <SectionHeader title="Student Emotion Colors" description="Customize the exact colors students see during their check-ins." />

      {/* Tabs */}
      <div className="flex flex-wrap bg-slate-100 p-1 rounded-2xl shadow-inner gap-1">
        <button
          onClick={() => setActiveTab("clock")}
          className={cn("flex-1 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all", activeTab === "clock" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          How Are You Feeling? (1-10)
        </button>
        <button
          onClick={() => setActiveTab("puzzle")}
          className={cn("flex-1 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all", activeTab === "puzzle" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          Color In Your Emotion
        </button>
      </div>

      <SettingsCard>
        {activeTab === "clock" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2"><span className="text-lg">⏱️</span> Clock Emotion Colors</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">These colors appear on the sliding clock screen (Scale 1 to 10).</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(clockLabels).sort((a,b)=>Number(a)-Number(b)).map(level => {
                const defaultColors: Record<string, string> = {
                  "1": "#6366f1", "2": "#818cf8", "3": "#a78bfa", "4": "#f472b6", "5": "#fb923c",
                  "6": "#34d399", "7": "#fbbf24", "8": "#60a5fa", "9": "#a78bfa", "10": "#f9a8d4"
                };
                const colorValue = clockColors[level] || defaultColors[level];
                
                return (
                  <div key={level} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-10 h-10 rounded-full font-black text-white flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: colorValue }}>
                      {level}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-700">{clockLabels[level]}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colorValue} 
                      onChange={e => updateClockColor(level, e.target.value)} 
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent shrink-0" 
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "puzzle" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2"><span className="text-lg">🧩</span> Puzzle Emotion Colors</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">These colors are used when students select a specific emotion for their puzzle lightbulb.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["Happy", "Sad", "Mad", "Scared", "Worried", "Excited"].map(emotion => {
                const emEmoji: Record<string, string> = { "Happy": "😊", "Sad": "😢", "Mad": "😡", "Scared": "😨", "Worried": "😟", "Excited": "🤩" };
                const defaultColors: Record<string, string> = { "Happy": "#22c55e", "Sad": "#3b82f6", "Mad": "#ef4444", "Scared": "#334155", "Worried": "#eab308", "Excited": "#ec4899" };
                const colorValue = puzzleColors[emotion] || defaultColors[emotion];
                
                return (
                  <div key={emotion} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-10 h-10 rounded-full text-lg flex items-center justify-center shrink-0 shadow-inner border border-white/20" style={{ backgroundColor: colorValue }}>
                      {emEmoji[emotion]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-black text-slate-700">{emotion}</div>
                    </div>
                    <input 
                      type="color" 
                      value={colorValue} 
                      onChange={e => updatePuzzleColor(emotion, e.target.value)} 
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent shrink-0" 
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </SettingsCard>

      <div className="flex items-center justify-end gap-4 pt-4">
        {saveSuccess && <span className="text-green-500 font-bold text-sm animate-pulse">Colors saved successfully!</span>}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-purple-300 transition-all flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Colors"}
        </button>
      </div>
    </div>
  );
}
