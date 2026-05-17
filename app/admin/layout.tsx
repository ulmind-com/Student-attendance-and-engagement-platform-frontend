"use client";

import { useState } from "react";
import { LayoutDashboard, Users, CalendarCheck, Bell, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="h-24 flex items-center px-6 border-b border-slate-100">
          <div className="text-[17px] font-black leading-tight bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
            Student Attendance<br/>& Engagement
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 rounded-2xl font-medium transition-all group",
                  isActive
                    ? "bg-purple-50 text-purple-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-purple-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link
            href="/"
            className="flex items-center px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-2xl font-medium transition-all group"
          >
            <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500" />
            Sign Out
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
    </div>
  );
}
