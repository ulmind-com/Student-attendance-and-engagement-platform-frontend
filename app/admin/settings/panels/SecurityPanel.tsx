"use client";
import { useState } from "react";
import { SectionHeader, SettingsCard, Toggle, SaveButton, Input, Label } from "./shared";
import { ShieldCheck, Lock, Eye, Database, ScrollText, CheckCircle2, Server } from "lucide-react";

const mockLogs = [
  { action: "Admin Login", user: "admin@school.edu", time: "Today 09:12 AM", status: "success" },
  { action: "Student Deleted", user: "admin@school.edu", time: "Today 08:55 AM", status: "warning" },
  { action: "OTP Generated", user: "system", time: "Today 08:00 AM", status: "success" },
  { action: "Failed Login", user: "unknown@test.com", time: "Yesterday 11:30 PM", status: "danger" },
  { action: "Settings Changed", user: "admin@school.edu", time: "Yesterday 05:00 PM", status: "success" },
];

export default function SecurityPanel() {
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [jwt, setJwt] = useState({ secret: "••••••••••••••••", expiry: "24h" });
  const [toggles, setToggles] = useState({ multiDevice: false, consent: true, backup: true, ipRestrict: false, audit: true });
  const t = (k: keyof typeof toggles) => (v: boolean) => setToggles(s => ({ ...s, [k]: v }));

  return (
    <div className="space-y-8 max-w-2xl">
      <SectionHeader title="Privacy & Security" description="Enterprise-grade security and data protection controls." />

      {/* Security Status */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Data Encrypted", Icon: ShieldCheck, iconClass: "text-green-200", color: "from-green-400 to-teal-500", status: "Active" },
          { label: "Backups", Icon: Database, iconClass: "text-blue-200", color: "from-blue-400 to-indigo-500", status: "Daily" },
          { label: "Audit Logs", Icon: ScrollText, iconClass: "text-purple-200", color: "from-purple-400 to-violet-500", status: "Enabled" },
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
              <input type="password" value={jwt.secret} onChange={e => setJwt(j => ({ ...j, secret: e.target.value }))}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-300 text-sm font-mono" />
              <button className="px-4 py-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"><Eye className="w-4 h-4 text-slate-500" /></button>
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
          {mockLogs.map((log, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.status === "success" ? "bg-green-400" : log.status === "warning" ? "bg-orange-400" : "bg-red-500"}`} />
              <div className="flex-1">
                <span className="text-sm font-bold text-slate-800">{log.action}</span>
                <span className="text-xs text-slate-400 ml-2">by {log.user}</span>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </SettingsCard>

      <div className="flex justify-end pt-2">
        <SaveButton onSave={() => console.log("Security saved")} />
      </div>
    </div>
  );
}
