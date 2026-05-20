"use client";
import { useState, useEffect } from "react";
import { SectionHeader, SettingsCard, Toggle, SaveButton } from "./shared";
import { Sparkles, TrendingDown, Brain, Bot, Zap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIInsightsPanel() {
  const [alertThreshold, setAlertThreshold] = useState(4);
  const [attendanceRisk, setAttendanceRisk] = useState(70);
  const [burnoutDays, setBurnoutDays] = useState(3);
  const [toggles, setToggles] = useState({ aiEngine: true, predictive: true, correlation: true, autoAlert: true });
  
  const [stats, setStats] = useState({ classes: 0, students: 0 });
  const [insights, setInsights] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const t = (k: keyof typeof toggles) => (v: boolean) => setToggles(s => ({ ...s, [k]: v }));

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const fetchData = async () => {
    try {
      const timestamp = Date.now();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/ai-insights?t=${timestamp}`);
      if (res.ok) {
        const data = await res.json();
        const settings = data.settings || {};
        setAlertThreshold(settings.alert_threshold || 4);
        setAttendanceRisk(settings.attendance_risk || 70);
        setBurnoutDays(settings.burnout_days || 3);
        setToggles({
          aiEngine: settings.ai_engine !== false,
          predictive: settings.predictive !== false,
          correlation: settings.correlation !== false,
          autoAlert: settings.auto_alert !== false,
        });
        setStats(data.stats || { classes: 0, students: 0 });
        setInsights(data.insights || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/ai-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_threshold: alertThreshold,
          attendance_risk: attendanceRisk,
          burnout_days: burnoutDays,
          ai_engine: toggles.aiEngine,
          predictive: toggles.predictive,
          correlation: toggles.correlation,
          auto_alert: toggles.autoAlert
        })
      });
      // Re-fetch to generate new insights based on potentially new thresholds
      await fetchData();
      showToast("AI configuration saved successfully!");
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 max-w-2xl relative">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/20 font-black text-sm flex items-center gap-3 border border-indigo-400"
          >
            <Sparkles className="w-5 h-5 text-indigo-100" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader title="AI Insights Engine" description="Configure the AI wellness analysis and predictive alert system." />

      {/* AI Status Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),transparent)]" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="font-black text-xl mb-1 flex items-center gap-2">
              {toggles.aiEngine ? "AI Engine Active" : "AI Engine Paused"} <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <p className="text-blue-100 text-sm font-medium">
              Analyzing emotional patterns across <span className="font-bold text-white">{stats.classes}</span> classes and <span className="font-bold text-white">{stats.students}</span> students in real time.
            </p>
            <div className="flex gap-2 mt-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${toggles.aiEngine ? "bg-white/20 text-white" : "bg-red-500/50 text-red-100"}`}>
                ● {toggles.aiEngine ? "Live Analysis" : "Offline"}
              </span>
              {toggles.predictive && <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full text-white">Risk Scoring Active</span>}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Feed */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-indigo-500" /> Live AI Trend Analysis</h3>
        <div className="space-y-3">
          {!toggles.aiEngine && (
            <div className="p-6 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl">
              Enable the AI Engine to view live insights.
            </div>
          )}
          {toggles.aiEngine && insights.map((insight, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className={`p-4 rounded-xl border ${insight.level === "high" ? "bg-red-50 border-red-100" : insight.level === "good" ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg font-black ${insight.level === "good" ? "text-green-500" : "text-red-500"}`}>{insight.trend}</span>
                <span className="text-xs font-black text-slate-500 uppercase">{insight.class}</span>
              </div>
              <p className="text-sm font-medium text-slate-700">{insight.insight}</p>
            </motion.div>
          ))}
          {toggles.aiEngine && insights.length === 0 && (
             <p className="text-slate-400 text-sm font-bold text-center py-4">No critical insights detected at this moment.</p>
          )}
        </div>
      </SettingsCard>

      {/* AI Sensitivity Controls */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-500" /> AI Sensitivity Controls</h3>
        <div className="space-y-5">
          {[
            { label: "Emotional Alert Threshold (score)", value: alertThreshold, set: setAlertThreshold, min: 1, max: 10, color: "indigo", desc: "Alert fires when mood score drops below this" },
            { label: "Attendance Risk Level (%)", value: attendanceRisk, set: setAttendanceRisk, min: 50, max: 100, color: "blue", desc: "Flag student when attendance falls below this" },
            { label: "Burnout Detection (days)", value: burnoutDays, set: setBurnoutDays, min: 1, max: 14, color: "cyan", desc: "Alert after this many consecutive low-mood days" },
          ].map(({ label, value, set, min, max, color, desc }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <span className={`text-sm font-mono text-${color}-600 font-black`}>{value}</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{desc}</p>
              <input type="range" min={min} max={max} value={value} onChange={e => set(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-500" />
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* AI Feature Toggles */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Bot className="w-4 h-4 text-indigo-500" /> AI Features</h3>
        <div className="divide-y divide-slate-50">
          <Toggle enabled={toggles.aiEngine} onChange={t("aiEngine")} label="AI Engine" description="Enable the core AI wellness analysis engine" />
          <Toggle enabled={toggles.predictive} onChange={t("predictive")} label="Predictive Alerts" description="AI predicts burnout and emotional decline before it happens" />
          <Toggle enabled={toggles.correlation} onChange={t("correlation")} label="Attendance Correlation" description="Correlate emotional data with attendance patterns" />
          <Toggle enabled={toggles.autoAlert} onChange={t("autoAlert")} label="Auto-generate Alerts" description="Automatically create alerts without admin action" />
        </div>
      </SettingsCard>

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md flex items-center gap-2"
        >
          <Brain className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save AI Configuration"}
        </button>
      </div>
    </div>
  );
}
