"use client";

import { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, Users, CalendarCheck, Bell, Settings, LogOut, Menu, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import { SaveSuccessProvider } from "./SaveSuccessProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(true);
  const [animationData, setAnimationData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    fetch('/lottie/Sandy Loading.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load Lottie:", err));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ── Live Clock (US Allentown / Eastern Time) ──
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
      const dateStr = now.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric", year: "numeric" });
      setCurrentTime(timeStr);
      setCurrentDate(dateStr);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Session Security: Block back/forward, right-click, dev tools ──
  useEffect(() => {
    // Block back/forward
    history.pushState(null, "", location.href);
    const blockNav = () => { history.pushState(null, "", location.href); };
    window.addEventListener("popstate", blockNav);

    // Block right-click
    const blockContextMenu = (e: MouseEvent) => { e.preventDefault(); };
    document.addEventListener("contextmenu", blockContextMenu);

    // Block dev tools shortcuts
    const blockKeys = (e: KeyboardEvent) => {
      if (e.key === "F12") { e.preventDefault(); return; }
      if (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key.toUpperCase())) { e.preventDefault(); return; }
      if (e.ctrlKey && e.key.toUpperCase() === "U") { e.preventDefault(); return; }
    };
    document.addEventListener("keydown", blockKeys);

    return () => {
      window.removeEventListener("popstate", blockNav);
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (pathname === href) return;
    setMobileOpen(false);
    setIsNavigating(true);
    setTimeout(() => {
      router.push(href);
      setTimeout(() => setIsNavigating(false), 300);
    }, 1200);
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
    { name: "Alerts", href: "/admin/alerts", icon: Bell },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Header */}
      <div className={cn(
        "h-20 flex items-center border-b border-slate-100 transition-all duration-300 flex-shrink-0",
        isMobile ? "px-5 justify-between" : collapsed ? "px-4 justify-center" : "px-6 justify-between"
      )}>
        {(isMobile || !collapsed) && (
          <div className="text-[15px] font-black leading-tight bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
            Student Attendance<br/>& Engagement
          </div>
        )}
        {isMobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-slate-500 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-600 flex items-center justify-center text-slate-500 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavigation(e, item.href)}
              title={(!isMobile && collapsed) ? item.name : undefined}
              className={cn(
                "flex items-center rounded-2xl font-medium transition-all group cursor-pointer",
                (!isMobile && collapsed) ? "px-0 py-3.5 justify-center" : "px-4 py-3.5",
                isActive
                  ? "bg-purple-50 text-purple-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  (!isMobile && collapsed) ? "" : "mr-3",
                  isActive ? "text-purple-600" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              {(isMobile || !collapsed) && <span className="text-[15px]">{item.name}</span>}
              {isActive && (isMobile || !collapsed) && (
                <div className="ml-auto w-1.5 h-5 rounded-full bg-purple-500" />
              )}
            </a>
          );
        })}
      </nav>

      {/* Sign Out + Clock */}
      <div className="p-3 border-t border-slate-100 flex-shrink-0 space-y-2">
        {/* Live Clock */}
        {(isMobile || !collapsed) ? (
          <div className="px-3 py-2.5 bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-0.5">
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Allentown, PA</span>
            </div>
            <div className="text-lg font-black text-slate-800 tabular-nums leading-tight">{currentTime}</div>
            <div className="text-[10px] font-medium text-slate-400 mt-0.5">{currentDate}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-2" title={`${currentTime} • ${currentDate}`}>
            <Clock className="w-4 h-4 text-purple-500 mb-1" />
            <span className="text-[9px] font-bold text-slate-500 tabular-nums leading-tight">{currentTime.replace(/ [AP]M/, "")}</span>
          </div>
        )}
        <Link
          href="/"
          title={(!isMobile && collapsed) ? "Sign Out" : undefined}
          className={cn(
            "flex items-center text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-2xl font-medium transition-all group",
            (!isMobile && collapsed) ? "px-0 py-3.5 justify-center" : "px-4 py-3.5"
          )}
        >
          <LogOut className={cn(
            "h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-red-500",
            (!isMobile && collapsed) ? "" : "mr-3"
          )} />
          {(isMobile || !collapsed) && <span className="text-[15px]">Sign Out</span>}
        </Link>
      </div>
    </>
  );

  return (
    <SaveSuccessProvider>
    <div className="min-h-screen bg-slate-50 flex font-outfit">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={cn(
          "hidden md:flex bg-white border-r border-slate-200 flex-col shadow-sm z-10 transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col md:hidden"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-auto relative flex flex-col min-w-0">
        {/* Subtle Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-200/40 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-blue-200/40 blur-3xl" />
        </div>

        {/* ── MOBILE TOP BAR ── */}
        <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-purple-50 flex items-center justify-center text-slate-600 transition-all active:scale-95"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-[14px] font-black bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
            {navigation.find(n => n.href === pathname)?.name || "Admin Panel"}
          </div>
          {/* Clock on mobile top bar */}
          <div className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1.5 rounded-xl">
            <Clock className="w-3 h-3 text-purple-500" />
            <span className="text-[10px] font-bold text-purple-600 tabular-nums">{currentTime}</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavigation(e, item.href)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl transition-all active:scale-95 min-w-[56px]",
                  isActive
                    ? "bg-purple-50 text-purple-600"
                    : "text-slate-400"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-purple-600" : "text-slate-400")} />
                <span className={cn("text-[10px] font-bold tracking-tight", isActive ? "text-purple-600" : "text-slate-400")}>
                  {item.name}
                </span>
                {isActive && (
                  <motion.div layoutId="bottomNavIndicator" className="absolute bottom-1 w-1 h-1 rounded-full bg-purple-500" />
                )}
              </a>
            );
          })}
        </div>
      </nav>

      {/* Extra bottom padding on mobile for the bottom nav */}
      <div className="md:hidden h-16 pointer-events-none" />

      {/* ── PREMIUM LOADING OVERLAY ── */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
          >
            <div className="relative flex flex-col items-center justify-center p-12">
              {animationData ? (
                <Lottie
                  animationData={animationData}
                  loop={true}
                  className="w-40 h-40 md:w-48 md:h-48 drop-shadow-2xl"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 font-black text-lg md:text-xl bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text text-center"
              >
                Loading Awesomeness...
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </SaveSuccessProvider>
  );
}
