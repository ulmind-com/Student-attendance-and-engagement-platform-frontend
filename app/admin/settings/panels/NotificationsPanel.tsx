"use client";
import { useState, useEffect } from "react";
import { SectionHeader, SettingsCard, Toggle, SaveButton } from "./shared";

type Channel = { email: boolean; push: boolean; sms: boolean };

export default function NotificationsPanel() {
  const [channels, setChannels] = useState<Record<string, Channel>>({
    wellness: { email: true, push: true, sms: false },
    attendance: { email: true, push: true, sms: true },
    parent: { email: true, push: false, sms: true },
    teacher: { email: false, push: true, sms: false },
  });
  const [sensitivity, setSensitivity] = useState<"Low" | "Medium" | "High">("Medium");
  const [templates, setTemplates] = useState({
    wellness: "🚨 Alert: {studentName} from {class} may need emotional support today.",
    attendance: "📋 {studentName} is marked {status} today at {time}.",
    parent: "💌 Dear Parent, {studentName} checked in with score {score}/10 today.",
  });
  
  const [adminNotificationEmail, setAdminNotificationEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/notifications`)
      .then(res => res.json())
      .then(data => setAdminNotificationEmail(data.admin_notification_email || ""))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_notification_email: adminNotificationEmail })
      });
      console.log("Notifications saved");
    } catch (e) {}
    setIsSaving(false);
  };
  const toggleChannel = (type: string, channel: keyof Channel) =>
    setChannels(c => ({ ...c, [type]: { ...c[type], [channel]: !c[type][channel] } }));

  const notifTypes = [
    { key: "wellness", label: "Wellness Alerts", emoji: "💛", desc: "Sent when student shows emotional decline" },
    { key: "attendance", label: "Attendance Alerts", emoji: "📅", desc: "Sent for absent or late students" },
    { key: "parent", label: "Parent Notifications", emoji: "👨‍👩‍👧", desc: "Daily wellness summary for parents" },
    { key: "teacher", label: "Teacher Alerts", emoji: "👩‍🏫", desc: "Classroom-level risk summaries" },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <SectionHeader title="Notifications" description="Control how and when alerts are delivered." />

      {/* Admin Email Configuration */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><span className="text-lg">📧</span> Admin Email Alerts (Brevo Integration)</h3>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Email ID for Wellness Alerts</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              value={adminNotificationEmail} 
              onChange={e => setAdminNotificationEmail(e.target.value)} 
              placeholder="e.g. admin@school.com"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" 
            />
          </div>
          <p className="text-xs text-slate-400 font-medium">When a student submits a low wellness score, a premium email alert will be sent instantly to this address via Brevo API.</p>
        </div>
      </SettingsCard>

      {/* Notification Channels */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><span className="text-lg">🔔</span> Delivery Channels</h3>
        <div className="space-y-4">
          {notifTypes.map(n => (
            <div key={n.key} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{n.emoji}</span>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{n.label}</div>
                  <div className="text-xs text-slate-500">{n.desc}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {(["email", "push", "sms"] as (keyof Channel)[]).map(ch => (
                  <button key={ch} onClick={() => toggleChannel(n.key, ch)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${channels[n.key][ch] ? "bg-violet-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-500"}`}>
                    {ch === "email" ? "📧 Email" : ch === "push" ? "📱 Push" : "💬 SMS"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Alert Sensitivity */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><span className="text-lg">🎛️</span> Alert Sensitivity</h3>
        <div className="grid grid-cols-3 gap-3">
          {(["Low", "Medium", "High"] as const).map(level => (
            <button key={level} onClick={() => setSensitivity(level)}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${
                sensitivity === level
                  ? level === "High" ? "border-red-400 bg-red-50" : level === "Medium" ? "border-orange-400 bg-orange-50" : "border-green-400 bg-green-50"
                  : "border-slate-100 bg-white hover:border-slate-200"
              }`}>
              <div className="text-2xl mb-1">{level === "Low" ? "🟢" : level === "Medium" ? "🟡" : "🔴"}</div>
              <div className={`font-black text-sm ${sensitivity === level ? (level === "High" ? "text-red-700" : level === "Medium" ? "text-orange-700" : "text-green-700") : "text-slate-600"}`}>{level}</div>
              <div className="text-xs text-slate-400 mt-0.5">{level === "Low" ? "Fewer alerts" : level === "Medium" ? "Balanced" : "All alerts"}</div>
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* Message Templates */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><span className="text-lg">📝</span> Alert Templates</h3>
        <div className="space-y-4">
          {Object.entries(templates).map(([key, val]) => (
            <div key={key}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 capitalize">{key} Template</label>
              <textarea value={val} onChange={e => setTemplates(t => ({ ...t, [key]: e.target.value }))} rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-400 resize-none font-medium text-slate-700" />
            </div>
          ))}
          <p className="text-xs text-slate-400">Use: <code className="bg-slate-100 px-1 rounded">{"{studentName}"}</code> <code className="bg-slate-100 px-1 rounded">{"{class}"}</code> <code className="bg-slate-100 px-1 rounded">{"{score}"}</code> <code className="bg-slate-100 px-1 rounded">{"{status}"}</code></p>
        </div>
      </SettingsCard>

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 active:scale-95 transition-all shadow-md"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
