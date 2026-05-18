"use client";

import { useState } from "react";
import { LayoutDashboard, Users, CalendarCheck, Bell, Settings, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Lottie from "lottie-react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isNavigating, setIsNavigating] = useState(true); // default true for initial load/refresh
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch('/lottie/Sandy Loading.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load Lottie:", err));
  }, []);

  // Handle initial load and refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 1500); // Spin for 1.5s on initial mount (login/refresh)
    return () => clearTimeout(timer);
  }, []);

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (pathname === href) return;
    
    setIsNavigating(true);
    // Add artificial delay for the premium lottie to spin
    setTimeout(() => {
      router.push(href);
      // Wait a tiny bit for the new page to render, then hide loader
      setTimeout(() => setIsNavigating(false), 300);
    }, 1200); // 1.2 seconds loading for premium feel
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
    { name: "Alerts", href: "/admin/alerts", icon: Bell },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-outfit">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Header with hamburger */}
        <div className={cn(
          "h-24 flex items-center border-b border-slate-100 transition-all duration-300",
          collapsed ? "px-4 justify-center" : "px-6 justify-between"
        )}>
          {!collapsed && (
            <div className="text-[17px] font-black leading-tight bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
              Student Attendance<br/>& Engagement
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-600 flex items-center justify-center text-slate-500 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-8 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavigation(e, item.href)}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "flex items-center rounded-2xl font-medium transition-all group cursor-pointer",
                  collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
                  isActive
                    ? "bg-purple-50 text-purple-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    collapsed ? "" : "mr-3",
                    isActive ? "text-purple-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                {!collapsed && <span>{item.name}</span>}
              </a>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <Link
            href="/"
            title={collapsed ? "Sign Out" : undefined}
            className={cn(
              "flex items-center text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-2xl font-medium transition-all group",
              collapsed ? "px-0 py-3 justify-center" : "px-4 py-3"
            )}
          >
            <LogOut className={cn(
              "h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-red-500",
              collapsed ? "" : "mr-3"
            )} />
            {!collapsed && <span>Sign Out</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {/* Subtle Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-200/40 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-blue-200/40 blur-3xl"></div>
        </div>
        
        <div className="p-8">
          {children}
        </div>
      </main>

      {/* Premium Global Loading Overlay */}
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
                  className="w-48 h-48 drop-shadow-2xl"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 font-black text-xl bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text text-center"
              >
                Loading Awesomeness...
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
