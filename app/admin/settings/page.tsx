"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Palette, Users, KeyRound, MessageSquare, BellRing, Shield, Sparkles, SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import SchoolInfoPanel from "./panels/SchoolInfoPanel";
import BrandingPanel from "./panels/BrandingPanel";
import ClassesUsersPanel from "./panels/ClassesUsersPanel";
import OTPPanel from "./panels/OTPPanel";
import EmotionalQuestionsPanel from "./panels/EmotionalQuestionsPanel";
import NotificationsPanel from "./panels/NotificationsPanel";
import SecurityPanel from "./panels/SecurityPanel";
import AIInsightsPanel from "./panels/AIInsightsPanel";
import AdvancedPanel from "./panels/AdvancedPanel";
import AdminUsersPanel from "./panels/AdminUsersPanel";

const tabs = [
  { id: "school",        icon: Building2,         label: "School Info",         color: "from-blue-500 to-cyan-500" },
  { id: "branding",      icon: Palette,           label: "Branding & Theme",    color: "from-purple-500 to-pink-500" },
  { id: "users",         icon: Users,             label: "Classes & Users",     color: "from-green-500 to-teal-500" },
  { id: "admins",        icon: Shield,            label: "Admin Accounts",      color: "from-violet-600 to-purple-700" },
  { id: "otp",           icon: KeyRound,          label: "OTP Settings",        color: "from-orange-500 to-yellow-500" },
  { id: "wellness",      icon: MessageSquare,     label: "Emotional Questions", color: "from-rose-500 to-pink-500" },
  { id: "notifications", icon: BellRing,          label: "Notifications",       color: "from-violet-500 to-purple-500" },
  { id: "security",      icon: Shield,            label: "Privacy & Security",  color: "from-red-500 to-rose-500" },
  { id: "ai",            icon: Sparkles,          label: "AI Insights",         color: "from-indigo-500 to-blue-500" },
  { id: "advanced",      icon: SlidersHorizontal, label: "Advanced",            color: "from-slate-600 to-slate-800" },
];

const panelMap: Record<string, React.ComponentType> = {
  school:        SchoolInfoPanel,
  branding:      BrandingPanel,
  users:         ClassesUsersPanel,
  admins:        AdminUsersPanel,
  otp:           OTPPanel,
  wellness:      EmotionalQuestionsPanel,
  notifications: NotificationsPanel,
  security:      SecurityPanel,
  ai:            AIInsightsPanel,
  advanced:      AdvancedPanel,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("school");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const ActivePanel = panelMap[activeTab];
  const activeTabData = tabs.find(t => t.id === activeTab)!;

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 min-h-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Platform Settings</h1>
        <p className="text-slate-500 mt-0.5 text-sm md:text-base font-medium">Configure every aspect of your emotional wellness platform.</p>
      </div>

      {/* ── MOBILE: Dropdown selector ── */}
      <div className="md:hidden relative z-20">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-white font-bold shadow-lg transition-all",
            `bg-gradient-to-r ${activeTabData.color}`
          )}
        >
          <div className="flex items-center gap-3">
            <activeTabData.icon className="w-5 h-5 text-white/90" />
            <span>{activeTabData.label}</span>
          </div>
          <motion.div animate={{ rotate: mobileMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-white/80" />
          </motion.div>
        </button>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all",
                      isActive
                        ? "bg-slate-50 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-r flex-shrink-0",
                      tab.color
                    )}>
                      <tab.icon className="w-4 h-4 text-white" />
                    </div>
                    <span>{tab.label}</span>
                    {isActive && (
                      <div className={cn("ml-auto w-2 h-2 rounded-full bg-gradient-to-r", tab.color)} />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── DESKTOP: Sidebar layout ── */}
      <div className="hidden md:flex flex-1 gap-6 overflow-hidden" style={{ height: "calc(100vh - 13rem)" }}>
        {/* Left Nav */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-1 overflow-y-auto pb-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "relative w-full flex items-center px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group overflow-hidden",
                  isActive
                    ? "text-white shadow-lg"
                    : "text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-bg"
                    className={cn("absolute inset-0 bg-gradient-to-r rounded-2xl", tab.color)}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <tab.icon className={cn("w-4 h-4 mr-3 relative z-10 flex-shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                <span className="relative z-10">{tab.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto relative z-10 w-2 h-2 rounded-full bg-white/60"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="flex-1 overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50">
          <div className={cn("h-1.5 w-full bg-gradient-to-r", activeTabData.color)} />
          <div className="h-full overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <ActivePanel />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── MOBILE: Panel content below dropdown ── */}
      <div className="md:hidden">
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className={cn("h-1.5 w-full bg-gradient-to-r", activeTabData.color)} />
          <div className="p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <ActivePanel />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
