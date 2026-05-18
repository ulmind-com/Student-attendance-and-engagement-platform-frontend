/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable prefer-const */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, SmilePlus, AlertTriangle,
  HeartPulse, ShieldCheck, ShieldAlert, Calendar, ArrowRight,
  CheckCircle2, Bell, Sparkles, Activity, X, Star,
  Sun, Cloud, Moon, Bot, BarChart2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar
} from "recharts";
import { cn } from "@/lib/utils";

const weeklyData = [
  { name: "Mon", score: 8.2, present: 2, absent: 1 },
  { name: "Tue", score: 8.5, present: 3, absent: 0 },
  { name: "Wed", score: 7.8, present: 2, absent: 1 },
  { name: "Thu", score: 8.9, present: 3, absent: 0 },
  { name: "Fri", score: 9.1, present: 3, absent: 0 },
];

const radarData = [
  { subject: "Happiness", value: 85 },
  { subject: "Safety", value: 90 },
  { subject: "Energy", value: 72 },
  { subject: "Social", value: 78 },
  { subject: "Focus", value: 68 },
  { subject: "Sleep", value: 82 },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getGreetingIcon() {
  const h = new Date().getHours();
  if (h < 12) return Sun;
  if (h < 17) return Cloud;
  return Moon;
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [time, setTime] = useState<Date | null>(null);
  const [activeInsight, setActiveInsight] = useState(0);
  const [activeModal, setActiveModal] = useState<"total" | "present" | "mood" | "wellness" | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`);
        if (res.ok) setStudents(await res.json());
      } catch {}
    };
    fetchStudents();
    // Start clock only on client after mount to avoid hydration mismatch
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cycle = setInterval(() => setActiveInsight(i => (i + 1) % 3), 4000);
    return () => clearInterval(cycle);
  }, []);

  // Derive stats from real DB students
  const totalStudents = students.length;
  const checkedInToday = students.filter(s => s.timeline?.some((e: any) => e.day === "Today")).length;
  const absentToday = totalStudents - checkedInToday;
  const riskCount = students.filter(s => s.risk !== "Stable").length;
  const resolvedCount = students.filter(s => s.risk === "Stable").length;
  const avgMood = students.length > 0
    ? (students.reduce((acc, s) => {
        const todayEntry = s.timeline?.find((e: any) => e.day === "Today");
        return acc + (todayEntry ? todayEntry.score : 7);
      }, 0) / students.length).toFixed(1)
    : "—";

  const liveCheckins = students.map(s => {
    const todayEntry = s.timeline?.find((e: any) => e.day === "Today");
    return {
      id: s.rollNumber,
      name: `${s.firstName} ${s.lastInitial}`,
      roll: s.rollNumber,
      emoji: todayEntry?.emoji || "😶",
      score: todayEntry?.score || 0,
      checkedIn: !!todayEntry,
      risk: s.risk,
      class: s.class_name || s.class || "N/A",
      profilePhoto: s.profilePhoto,
      initial: s.firstName[0]
    };
  });

  const aiInsights = [
    { text: `${totalStudents} students are enrolled. ${checkedInToday} checked in today.`, Icon: BarChart2, color: "from-blue-500 to-cyan-500" },
    { text: riskCount > 0 ? `${riskCount} student(s) need emotional attention right now.` : "All students are emotionally stable today!", Icon: riskCount > 0 ? AlertTriangle : CheckCircle2, color: riskCount > 0 ? "from-red-500 to-orange-500" : "from-green-500 to-teal-500" },
    { text: `Average mood score today is ${avgMood}/10. Keep encouraging your class!`, Icon: SmilePlus, color: "from-purple-500 to-pink-500" },
  ];

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  }

  const statCards = [
    { title: "Total Students", value: String(totalStudents), sub: "Enrolled", icon: Users, gradient: "from-blue-500 to-cyan-600", glow: "shadow-blue-200", modalKey: "total" as const },
    { title: "Present Today", value: String(checkedInToday), sub: `${absentToday} absent`, icon: CheckCircle2, gradient: "from-green-500 to-teal-500", glow: "shadow-green-200", modalKey: "present" as const },
    { title: "Avg Mood Score", value: `${avgMood}`, sub: "Out of 10", icon: SmilePlus, gradient: "from-purple-500 to-violet-600", glow: "shadow-purple-200", modalKey: "mood" as const },
    { title: "Wellness Alerts", value: String(riskCount), sub: riskCount > 0 ? "Need attention" : "All clear!", icon: riskCount > 0 ? AlertTriangle : ShieldCheck, gradient: riskCount > 0 ? "from-red-500 to-rose-600" : "from-green-400 to-teal-500", glow: riskCount > 0 ? "shadow-red-200" : "shadow-green-200", modalKey: "wellness" as const },
  ];

  return (
    <div className="space-y-8">
      {/* ── MODALS ── */}
      <AnimatePresence>
        {activeModal === "total" && (
          <StatModal onClose={() => setActiveModal(null)} title="All Enrolled Students" subtitle={`${totalStudents} students in the system`} gradient="from-blue-500 to-cyan-600">
            <div className="space-y-3">
              {students.map((s, i) => (
                <motion.div key={s.rollNumber} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-all">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center font-black text-white text-lg flex-shrink-0 overflow-hidden shadow-inner">
                    {s.profilePhoto ? <img src={s.profilePhoto} className="w-full h-full object-cover" /> : s.firstName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-slate-800">{s.firstName} {s.lastInitial}</div>
                    <div className="text-xs text-slate-500 font-medium">Roll: {s.rollNumber} • {s.class_name || s.class || "N/A"}</div>
                  </div>
                  <div className={cn("px-3 py-1 rounded-full text-xs font-black",
                    s.risk === "Stable" ? "bg-green-100 text-green-700" :
                    s.risk === "Needs Attention" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700")}>
                    {s.risk}
                  </div>
                </motion.div>
              ))}
              {students.length === 0 && <p className="text-center text-slate-400 py-6 font-medium">No students in database yet.</p>}
            </div>
          </StatModal>
        )}

        {activeModal === "present" && (
          <StatModal onClose={() => setActiveModal(null)} title="Present Today" subtitle={`${checkedInToday} checked in · ${absentToday} absent`} gradient="from-green-500 to-teal-500">
            <div className="space-y-3">
              {liveCheckins.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-all",
                    s.checkedIn ? "bg-green-50 border-green-100 hover:bg-green-100" : "bg-red-50 border-red-100 opacity-70")}>
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden shadow-inner flex-shrink-0 relative">
                    {s.profilePhoto ? <img src={s.profilePhoto} className="w-full h-full object-cover opacity-80" /> : s.initial}
                    <div className="absolute inset-0 flex items-center justify-center text-xl">{s.checkedIn ? s.emoji : "❌"}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-slate-800">{s.name}</div>
                    <div className="text-xs text-slate-500 font-medium">Roll: {s.roll}</div>
                  </div>
                  <div className={cn("px-3 py-1.5 rounded-xl text-xs font-black",
                    s.checkedIn ? "bg-green-600 text-white" : "bg-red-100 text-red-600")}>
                    {s.checkedIn ? "✓ Present" : "✗ Absent"}
                  </div>
                </motion.div>
              ))}
              {students.length === 0 && <p className="text-center text-slate-400 py-6 font-medium">No students in database yet.</p>}
            </div>
          </StatModal>
        )}

        {activeModal === "mood" && (
          <StatModal onClose={() => setActiveModal(null)} title="Mood Score Breakdown" subtitle={`Class average: ${avgMood}/10`} gradient="from-purple-500 to-violet-600">
            <div className="space-y-4">
              {liveCheckins.map((s, i) => {
                const score = s.checkedIn ? s.score : null;
                const pct = score ? (score / 10) * 100 : 0;
                const color = !score ? "bg-slate-200" : score >= 8 ? "bg-gradient-to-r from-green-400 to-teal-400" : score >= 5 ? "bg-gradient-to-r from-orange-400 to-amber-400" : "bg-gradient-to-r from-red-400 to-rose-500";
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden shadow-inner flex-shrink-0 relative">
                        {s.profilePhoto ? <img src={s.profilePhoto} className="w-full h-full object-cover opacity-70" /> : s.initial}
                        <div className="absolute inset-0 flex items-center justify-center text-xl">{s.emoji}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-slate-800 text-sm">{s.name}</span>
                          <span className={cn("text-sm font-black", !score ? "text-slate-400" : score >= 8 ? "text-green-600" : score >= 5 ? "text-orange-500" : "text-red-500")}>
                            {score ? `${score}/10` : "Not checked in"}
                          </span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.08 + 0.2, duration: 0.6, ease: "easeOut" }}
                            className={cn("h-full rounded-full", color)} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {students.length === 0 && <p className="text-center text-slate-400 py-6 font-medium">No students in database yet.</p>}
            </div>
          </StatModal>
        )}

        {activeModal === "wellness" && (
          <StatModal
            onClose={() => setActiveModal(null)}
            title="Wellness Alerts"
            subtitle={riskCount > 0 ? `${riskCount} student(s) need attention` : "All students are emotionally stable"}
            gradient={riskCount > 0 ? "from-red-500 to-rose-600" : "from-green-500 to-teal-500"}
          >
            <div className="space-y-4">
              {riskCount === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="font-black text-green-600 text-lg">All Clear!</p>
                  <p className="text-slate-500 text-sm font-medium mt-1">Every student is emotionally stable today.</p>
                </motion.div>
              ) : students.filter(s => s.risk !== "Stable").map((s, i) => {
                  const todayEntry = s.timeline?.find((e: any) => e.day === "Today");
                  const isHigh = s.risk === "Emotional Drop";
                  const cardBg = isHigh ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200";
                  const badge = isHigh ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700";
                  const barColor = isHigh ? "bg-gradient-to-r from-red-400 to-rose-500" : "bg-gradient-to-r from-orange-400 to-amber-400";
                  const accentText = isHigh ? "text-red-600" : "text-orange-600";
                  return (
                    <motion.div key={s.rollNumber}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className={`rounded-2xl border-2 p-4 space-y-3 ${cardBg}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-white/80 overflow-hidden relative">
                          {s.profilePhoto ? <img src={s.profilePhoto} className="w-full h-full object-cover opacity-60" /> : null}
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">{todayEntry?.emoji ?? "⚠️"}</div>
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-slate-800">{s.firstName} {s.lastInitial}</div>
                          <div className="text-xs text-slate-500 font-medium">Roll: {s.rollNumber} • {s.class_name || s.class || "N/A"}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${badge}`}>{s.risk}</span>
                      </div>

                      {todayEntry && (
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-slate-500">Mood Score</span>
                            <span className={accentText}>{todayEntry.score}/10</span>
                          </div>
                          <div className="h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(todayEntry.score / 10) * 100}%` }}
                              transition={{ delay: i * 0.08 + 0.3, duration: 0.7, ease: "easeOut" }}
                              className={`h-full rounded-full ${barColor}`}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2 bg-white/70 rounded-xl p-3 border border-white">
                        <Bot className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-bold text-slate-600">
                          {isHigh
                            ? "Immediate counselor review recommended. Student reported feeling very low."
                            : "Talk privately during lunch break. Monitor for the next 2 days."}
                        </p>
                      </div>

                      <a href="/admin/alerts"
                        className={`flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-black text-white transition-all active:scale-95 shadow-md ${isHigh ? "bg-red-500 hover:bg-red-600 shadow-red-200" : "bg-orange-500 hover:bg-orange-600 shadow-orange-200"}`}>
                        View Full Alert Details →
                      </a>
                    </motion.div>
                  );
                })
              }
            </div>
          </StatModal>
        )}
      </AnimatePresence>
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-slate-800 tracking-tight"
          >
            {getGreeting()}, Teacher <span className="inline-flex ml-1">{(() => { const G = getGreetingIcon(); return <G className="w-8 h-8 text-amber-500 inline" />; })()}</span>
          </motion.h1>
          <p className="text-slate-500 mt-1 font-medium">Here is the emotional wellness summary for today.</p>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-slate-100 text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {time ? time.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "\u00a0"}
            </div>
            <div className="text-2xl font-black text-slate-800 font-mono tracking-widest" suppressHydrationWarning>
              {time ? time.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:-- --"}
            </div>
          </div>
        </div>
      </div>

      {/* ── AI INSIGHT TICKER ── */}
      <div className={`bg-gradient-to-r ${aiInsights[activeInsight].color} rounded-2xl px-6 py-4 text-white flex items-center gap-4 shadow-lg overflow-hidden relative`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(255,255,255,0.15),transparent)]" />
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 relative z-10">
          {(() => { const I = aiInsights[activeInsight].Icon; return <I className="w-5 h-5 text-white" />; })()}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={activeInsight}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="font-bold text-sm relative z-10 flex-1"
          >
            <span className="opacity-70 mr-2 inline-flex items-center gap-1"><Bot className="w-3.5 h-3.5" /> AI Insight:</span> {aiInsights[activeInsight].text}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1 relative z-10">
          {aiInsights.map((_, i) => (
            <button key={i} onClick={() => setActiveInsight(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === activeInsight ? "bg-white" : "bg-white/40"}`} />
          ))}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => card.modalKey && setActiveModal(card.modalKey)}
            className={cn(
              `relative overflow-hidden bg-gradient-to-br ${card.gradient} rounded-3xl p-5 text-white shadow-xl ${card.glow}`,
              card.modalKey ? "cursor-pointer" : "cursor-default"
            )}
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-8 translate-x-8 blur-xl" />
            {card.modalKey && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <ArrowRight className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-4xl font-black mb-1">{card.value}</div>
              <div className="font-bold text-sm text-white/90">{card.title}</div>
              <div className="text-xs text-white/70 mt-0.5">{card.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CHARTS + SIDEBAR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-800">Class Emotional Trend</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Weekly mood score overview</p>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xs font-bold text-purple-600">Live</span>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} domain={[0, 10]} />
                <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", fontWeight: "bold" }} />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fill="url(#scoreGrad)" dot={{ fill: "#8b5cf6", r: 5, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8, fill: "#8b5cf6" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wellness Radar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-black text-slate-800 mb-1">Wellness Radar</h2>
          <p className="text-xs text-slate-400 font-medium mb-4">Class-wide emotional health</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Class" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: Students + Attendance Bar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Students from DB */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Student Wellness Board
            </h2>
            <span className="text-xs font-bold text-slate-400">{totalStudents} students</span>
          </div>
          <div className="space-y-3">
            {liveCheckins.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-medium">No students in database yet.</p>
              </div>
            ) : liveCheckins.map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all group cursor-pointer"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center font-black text-purple-700 flex-shrink-0">
                  {student.name[0]}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-800 text-sm">{student.name}</span>
                    <span className="text-xs text-slate-400">Roll: {student.roll}</span>
                  </div>
                  <div className="text-xs text-slate-500">{student.class}</div>
                </div>
                {/* Emoji + Score */}
                <div className="flex items-center gap-2">
                  <span className="text-xl">{student.emoji}</span>
                  {student.checkedIn ? (
                    <div className={cn("text-sm font-black", student.score >= 7 ? "text-green-500" : student.score >= 4 ? "text-orange-500" : "text-red-500")}>
                      {student.score}/10
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">Not checked in</span>
                  )}
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-black flex-shrink-0",
                    student.risk === "Stable" ? "bg-green-100 text-green-600" :
                    student.risk === "Needs Attention" ? "bg-orange-100 text-orange-600" :
                    "bg-red-100 text-red-600"
                  )}>
                    {student.risk === "Stable" ? <ShieldCheck className="w-3 h-3 inline mr-0.5" /> : <ShieldAlert className="w-3 h-3 inline mr-0.5" />}
                    {student.risk}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar: Smart Alert + Attendance Bar */}
        <div className="space-y-5">
          {/* Smart Alert */}
          {riskCount > 0 ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl p-5 text-white relative overflow-hidden shadow-xl shadow-red-200"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
                <h3 className="font-black text-lg">Smart Alerts</h3>
              </div>
              <p className="text-sm text-red-100 font-medium mb-4 relative z-10">
                {riskCount} student(s) showing emotional risk patterns. Immediate attention may be needed.
              </p>
              <a href="/admin/alerts" className="block w-full py-2.5 bg-white text-red-600 rounded-xl font-black text-sm text-center hover:bg-red-50 transition-colors active:scale-95 relative z-10 flex items-center justify-center gap-1">
                Review Alerts <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ) : (
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl p-5 text-white shadow-xl shadow-green-200">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-7 h-7" />
                <h3 className="font-black text-lg">All Clear!</h3>
              </div>
              <p className="text-sm text-green-100 font-medium">All students are emotionally stable today. Great work! 🎉</p>
            </div>
          )}

          {/* Weekly Attendance Bar */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 mb-1 text-sm">Weekly Attendance</h3>
            <p className="text-xs text-slate-400 mb-4">Present vs Absent per day</p>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barSize={10} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", fontWeight: "bold" }} />
                  <Bar dataKey="present" name="Present" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="absent" name="Absent" fill="#fca5a5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><div className="w-3 h-3 rounded-sm bg-purple-500" />Present</div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><div className="w-3 h-3 rounded-sm bg-red-300" />Absent</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 mb-3 text-sm">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "View All Students", href: "/admin/students", icon: Users, color: "text-purple-600 bg-purple-50" },
                { label: "Attendance Center", href: "/admin/attendance", icon: Calendar, color: "text-blue-600 bg-blue-50" },
                { label: "Smart Alerts", href: "/admin/alerts", icon: Bell, color: "text-red-600 bg-red-50" },
              ].map(action => (
                <a key={action.label} href={action.href}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${action.color}`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── StatModal Component ──
function StatModal({ children, onClose, title, subtitle, gradient }: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  subtitle: string;
  gradient: string;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${gradient} p-6 text-white relative overflow-hidden flex-shrink-0`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent)]" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight">{title}</h2>
              <p className="text-white/80 text-sm font-medium mt-0.5">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm flex-shrink-0"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
