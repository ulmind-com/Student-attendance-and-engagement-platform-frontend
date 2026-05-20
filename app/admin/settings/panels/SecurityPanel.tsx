"use client";
import { useState, useEffect } from "react";
import { SectionHeader, SettingsCard, Toggle, SaveButton, Input, Label } from "./shared";
import { ShieldCheck, Lock, Eye, Database, ScrollText, CheckCircle2, Server, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SecurityPanel() {
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [jwt, setJwt] = useState({ secret: "••••••••••••••••", expiry: "24h" });
  const [showJwt, setShowJwt] = useState(false);
  const [toggles, setToggles] = useState({ multiDevice: false, consent: true, backup: true, ipRestrict: false, audit: true });
  const [isSaving, setIsSaving] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const t = (k: keyof typeof toggles) => (v: boolean) => setToggles(s => ({ ...s, [k]: v }));

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const fetchData = async () => {
    try {
      const timestamp = Date.now();
      const [secRes, logsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/security?t=${timestamp}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/audit-log?t=${timestamp}`)
      ]);
      
      if (secRes.ok) {
        const data = await secRes.json();
        setJwt(j => ({ ...j, secret: data.jwt_secret || "••••••••••••••••" }));
        setSessionTimeout(data.session_timeout || 60);
        setToggles({
          multiDevice: data.multi_device || false,
          ipRestrict: data.ip_restriction || false,
          backup: data.backup !== false,
          consent: data.consent !== false,
          audit: data.audit !== false
        });
      }
      
      if (logsRes.ok) {
        const logs = await logsRes.json();
        setAuditLogs(logs.slice(0, 5)); // Show 5 most recent
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/security`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt_secret: jwt.secret,
          session_timeout: sessionTimeout,
          multi_device: toggles.multiDevice,
          ip_restriction: toggles.ipRestrict,
          backup: toggles.backup,
          consent: toggles.consent,
          audit: toggles.audit
        })
      });
      await fetchData(); // refreshing audit logs because we added one
      showToast("Security settings saved successfully!");
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
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl shadow-slate-900/20 font-black text-sm flex items-center gap-3 border border-slate-700"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader title="Privacy & Security" description="Enterprise-grade security and data protection controls." />

      {/* Security Status */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Data Encrypted", Icon: ShieldCheck, iconClass: "text-green-200", color: "from-green-400 to-teal-500", status: "Active" },
          { label: "Backups", Icon: Database, iconClass: "text-blue-200", color: "from-blue-400 to-indigo-500", status: toggles.backup ? "Daily" : "Off" },
          { label: "Audit Logs", Icon: ScrollText, iconClass: "text-purple-200", color: "from-purple-400 to-violet-500", status: toggles.audit ? "Enabled" : "Disabled" },
        ].map(item => (
          <div key={item.label} className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 text-white text-center`}>
            <div className="flex justify-center mb-2"><item.Icon className={`w-6 h-6 ${item.iconClass}`} /></div>
            <div className="font-black text-sm">{item.label}</div>
            <div className="text-xs opacity-80 mt-0.5 bg-white/20 rounded-full px-2 py-0.5">{item.status}</div>
          </div>
        ))}
      </div>

      {/* Authentication */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><Lock className="w-4 h-4 text-red-500" /> Authentication</h3>
        <div className="space-y-4">
          <div><Label>JWT Secret Key</Label>
            <div className="flex gap-2">
              <input type={showJwt ? "text" : "password"} value={jwt.secret} onChange={e => setJwt(j => ({ ...j, secret: e.target.value }))}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-300 text-sm font-mono text-slate-800 font-bold" />
              <button onClick={() => setShowJwt(!showJwt)} className="px-4 py-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                {showJwt ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-bold text-slate-700">Session Timeout</span>
              <span className="text-sm font-mono text-red-600 font-bold">{sessionTimeout} min</span>
            </div>
            <input type="range" min={5} max={480} value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-red-500" />
          </div>
        </div>
        <div className="mt-4 divide-y divide-slate-50">
          <Toggle enabled={toggles.multiDevice} onChange={t("multiDevice")} label="Multi-Device Login" description="Allow same account on multiple devices simultaneously" />
          <Toggle enabled={toggles.ipRestrict} onChange={t("ipRestrict")} label="IP Restriction" description="Only allow logins from registered IP addresses" />
        </div>
      </SettingsCard>

      {/* Data Protection */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-500" /> Data Protection</h3>
        <div className="divide-y divide-slate-50">
          <Toggle enabled={toggles.backup} onChange={t("backup")} label="Auto Database Backup" description="Daily encrypted backup of all student data" />
          <Toggle enabled={toggles.consent} onChange={t("consent")} label="Parent Consent Tracking" description="Require digital consent before storing student data" />
          <Toggle enabled={toggles.audit} onChange={t("audit")} label="Audit Logging" description="Track all admin actions and changes" />
        </div>
      </SettingsCard>

      {/* Audit Log */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><ScrollText className="w-4 h-4 text-slate-500" /> Recent Activity Log</h3>
        <div className="space-y-2">
          {auditLogs.map((log, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.action === "LOGIN" ? "bg-green-400" : log.action === "UPDATE" || log.action === "RESOLVE" ? "bg-blue-400" : log.action === "DELETE" ? "bg-red-500" : "bg-purple-400"}`} />
              <div className="flex-1">
                <span className="text-sm font-bold text-slate-800">{log.details}</span>
                <span className="text-xs text-slate-400 ml-2">({log.entity})</span>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{log.timestamp}</span>
            </div>
          ))}
          {auditLogs.length === 0 && (
             <div className="text-center text-sm font-bold text-slate-400 py-4">No recent activity.</div>
          )}
        </div>
      </SettingsCard>

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 active:scale-95 transition-all shadow-md"
        >
          {isSaving ? "Saving..." : "Save Security Rules"}
        </button>
      </div>
    </div>
  );
}
