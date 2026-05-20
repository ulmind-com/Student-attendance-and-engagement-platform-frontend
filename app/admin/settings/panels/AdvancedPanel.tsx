"use client";
import { useState, useEffect } from "react";
import { SectionHeader, SettingsCard, Toggle, SaveButton, Input, Label } from "./shared";
import { Database, Zap, Activity, Key, Download, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdvancedPanel() {
  const [apiKey] = useState("sk-kids-" + Math.random().toString(36).slice(2, 18));
  const [webhookUrl, setWebhookUrl] = useState("");
  const [toggles, setToggles] = useState({ animations: true, aiEngine: true, sounds: false, parentPortal: true, debugMode: false, productionMode: true });
  const [health, setHealth] = useState({ api: 98, db: 100, memory: 62, uptime: "7d 4h 12m" });
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const t = (k: keyof typeof toggles) => (v: boolean) => setToggles(s => ({ ...s, [k]: v }));

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/advanced?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const settings = data.settings || {};
        setWebhookUrl(settings.webhook_url || "");
        setToggles({
          animations: settings.animations !== false,
          aiEngine: settings.ai_engine !== false,
          sounds: settings.sounds === true,
          parentPortal: settings.parent_portal !== false,
          productionMode: settings.production_mode !== false,
          debugMode: settings.debug_mode === true,
        });
        setHealth(data.health || { api: 98, db: 100, memory: 62, uptime: "7d 4h 12m" });
        setLastBackup(data.last_backup);
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/advanced/backup`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLastBackup(data.last_backup);
        showToast("Database backup completed successfully.");
      }
    } catch (e) {
      console.error("Backup failed", e);
    }
    setIsBackingUp(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/advanced/export`);
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `kids_attendance_export_${new Date().getTime()}.json`;
        a.click();
        showToast("Data export downloaded.");
      }
    } catch (e) {
      console.error("Export failed", e);
    }
    setIsExporting(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/advanced`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhook_url: webhookUrl,
          animations: toggles.animations,
          ai_engine: toggles.aiEngine,
          sounds: toggles.sounds,
          parent_portal: toggles.parentPortal,
          production_mode: toggles.productionMode,
          debug_mode: toggles.debugMode
        })
      });
      await fetchData(); // Refresh logs
      showToast("Advanced settings saved successfully.");
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
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl shadow-slate-900/20 font-black text-sm flex items-center gap-3 border border-slate-700"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader title="Advanced Settings" description="API management, database, system health, and feature toggles." />

      {/* System Health */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "API Health", value: health.api, color: "from-green-400 to-teal-500", unit: "%" },
          { label: "DB Health", value: health.db, color: "from-blue-400 to-indigo-500", unit: "%" },
          { label: "Memory", value: health.memory, color: "from-orange-400 to-amber-500", unit: "%" },
          { label: "Uptime", value: health.uptime, color: "from-purple-400 to-violet-500", unit: "" },
        ].map(item => (
          <div key={item.label} className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 text-white`}>
            <div className="text-xs font-bold uppercase opacity-80 mb-1">{item.label}</div>
            <div className="text-2xl font-black">{item.value}{item.unit}</div>
            {typeof item.value === "number" && (
              <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${item.value}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* API Management */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><Key className="w-4 h-4 text-slate-500" /> API Management</h3>
        <div className="space-y-4">
          <div>
            <Label>API Key</Label>
            <div className="flex gap-2">
              <input readOnly value={apiKey} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-600 outline-none" />
              <button onClick={() => { navigator.clipboard.writeText(apiKey); showToast("API Key copied to clipboard."); }} className="px-4 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 active:scale-95 transition-all">Copy</button>
            </div>
          </div>
          <div>
            <Label>Webhook URL</Label>
            <Input value={webhookUrl} onChange={setWebhookUrl} placeholder="https://your-app.com/webhook" />
          </div>
        </div>
      </SettingsCard>

      {/* Database Controls */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><Database className="w-4 h-4 text-blue-500" /> Database Controls</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleBackup} disabled={isBackingUp}
            className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md">
            <RefreshCw className={`w-4 h-4 ${isBackingUp ? "animate-spin" : ""}`} /> {isBackingUp ? "Backing up..." : "Backup Now"}
          </button>
          <button onClick={handleExport} disabled={isExporting}
            className="flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 active:scale-95 transition-all shadow-md">
            <Download className="w-4 h-4" /> {isExporting ? "Exporting..." : "Export JSON"}
          </button>
        </div>
        <div className={`mt-4 p-3 rounded-xl text-xs font-medium border ${lastBackup ? "bg-green-50 border-green-100 text-green-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
          {lastBackup ? `✅ Last backup completed: ${lastBackup}` : "⚠️ Last backup: Never. Set up auto-backup in Security settings or trigger manually."}
        </div>
      </SettingsCard>

      {/* Feature Toggles */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> Feature Toggles</h3>
        <div className="divide-y divide-slate-50">
          <Toggle enabled={toggles.animations} onChange={t("animations")} label="Animations" description="Enable all UI animations and transitions" />
          <Toggle enabled={toggles.aiEngine} onChange={t("aiEngine")} label="AI Engine" description="Enable AI emotional analysis features" />
          <Toggle enabled={toggles.sounds} onChange={t("sounds")} label="Sound Effects" description="Play soft sounds on check-in completion" />
          <Toggle enabled={toggles.parentPortal} onChange={t("parentPortal")} label="Parent Portal" description="Allow parents to view their child's reports" />
          <Toggle enabled={toggles.productionMode} onChange={t("productionMode")} label="Production Mode" description="Optimized for live deployment" />
          <Toggle enabled={toggles.debugMode} onChange={t("debugMode")} label="Debug Mode" description="Show verbose API errors and logs" />
        </div>
      </SettingsCard>

      {/* Error Logs */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-green-500" /> System Logs</h3>
        <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs space-y-2 max-h-60 overflow-y-auto">
          {logs.map((log, idx) => (
             <div key={idx} className={log.level === 'WARN' ? 'text-yellow-400' : log.level === 'API' ? 'text-blue-400' : 'text-green-400'}>
               [{log.level}] {log.msg}
             </div>
          ))}
          {logs.length === 0 && (
             <div className="text-slate-500 italic">No system logs available yet...</div>
          )}
        </div>
      </SettingsCard>

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 active:scale-95 transition-all shadow-md"
        >
          {isSaving ? "Saving..." : "Save Advanced Settings"}
        </button>
      </div>
    </div>
  );
}
