"use client";
import { useState } from "react";
import { SectionHeader, SettingsCard, Toggle, SaveButton, Input, Label } from "./shared";
import { Database, Zap, Activity, Key, Download, RefreshCw } from "lucide-react";

export default function AdvancedPanel() {
  const [apiKey] = useState("sk-kids-" + Math.random().toString(36).slice(2, 18));
  const [webhookUrl, setWebhookUrl] = useState("");
  const [toggles, setToggles] = useState({ animations: true, aiEngine: true, sounds: false, parentPortal: true, debugMode: false, productionMode: true });
  const t = (k: keyof typeof toggles) => (v: boolean) => setToggles(s => ({ ...s, [k]: v }));
  const [health] = useState({ api: 98, db: 100, memory: 62, uptime: "7d 4h 12m" });

  const handleBackup = () => { alert("Backup initiated! Download will start shortly."); };
  const handleExport = () => { const data = JSON.stringify({ students: [], backup: new Date().toISOString() }); const blob = new Blob([data], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "kids_wellness_backup.json"; a.click(); };

  return (
    <div className="space-y-8 max-w-2xl">
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
              <button onClick={() => navigator.clipboard.writeText(apiKey)} className="px-4 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 active:scale-95 transition-all">Copy</button>
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
          <button onClick={handleBackup}
            className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md">
            <RefreshCw className="w-4 h-4" /> Backup Now
          </button>
          <button onClick={handleExport}
            className="flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 active:scale-95 transition-all shadow-md">
            <Download className="w-4 h-4" /> Export Data
          </button>
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium">
          ⚠️ Last backup: Never. Set up auto-backup in Security settings.
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
        <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
          <div className="text-green-400">[INFO] Backend started on port 8000</div>
          <div className="text-green-400">[INFO] Mock DB initialized with 3 students</div>
          <div className="text-blue-400">[API] GET /api/students — 200 OK — 12ms</div>
          <div className="text-blue-400">[API] GET /api/magic-code — 200 OK — 8ms</div>
          <div className="text-yellow-400">[WARN] MongoDB Atlas connection timed out — using mock DB</div>
          <div className="text-green-400">[INFO] All systems operational</div>
        </div>
      </SettingsCard>

      <div className="flex justify-end pt-2">
        <SaveButton onSave={() => console.log("Advanced settings saved")} />
      </div>
    </div>
  );
}
