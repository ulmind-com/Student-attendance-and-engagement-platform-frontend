"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Calendar as CalendarIcon, ShieldAlert, MoreVertical, Key } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [magicCode, setMagicCode] = useState<string>("1234");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const fetchMagicCode = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/magic-code`);
      if (res.ok) {
        const data = await res.json();
        setMagicCode(data.code);
        setExpiresAt(new Date(data.expires_at));
      }
    } catch (e) {}
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (e) {
        console.error("Failed to fetch students", e);
      }
    };
    fetchStudents();
    fetchMagicCode();
  }, []);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft("00:00:00");
        clearInterval(interval);
      } else {
        setIsExpired(false);
        const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        setTimeLeft(`${h}:${m}:${s}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const generateNewCode = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/magic-code/generate`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setMagicCode(data.code);
        setExpiresAt(new Date(data.expires_at));
        setIsExpired(false);
      }
    } catch (e) {}
  };

  // Heatmap calculation
  const heatmapDays = useMemo(() => {
    const days = [];
    const todayStr = new Date().toISOString().split('T')[0];
    for(let i=29; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      let present = 0;
      let alert = 0;
      students.forEach(s => {
        const entry = s.timeline?.find((t: any) => t.date === dateStr || (t.day === "Today" && dateStr === todayStr));
        if (entry && entry.status === "present") present++;
        if (entry && entry.alert) alert++;
      });

      let type = 'absent';
      if (present > 0) type = 'present';
      if (alert > 0) type = 'alert';

      days.push({ date: dateStr, type, displayDay: 30 - i, presentCount: present, alertCount: alert });
    }
    return days;
  }, [students]);

  // Derive dynamic check-ins for TODAY
  const todayStr = new Date().toISOString().split('T')[0];
  const liveCheckins = students
    .filter(s => s.timeline && s.timeline.some((t: any) => t.date === todayStr || t.day === "Today"))
    .map(s => {
      const todayEntry = s.timeline.find((t: any) => t.date === todayStr || t.day === "Today");
      return {
        id: s.rollNumber,
        name: `${s.firstName} ${s.lastInitial}`,
        roll: s.rollNumber,
        emoji: todayEntry.emoji,
        score: todayEntry.score,
        time: "Just now", 
        status: "Present"
      };
    }).reverse();

  // Daily Table for SELECTED DATE
  const studentsTable = students
    .filter(s => {
      if (!searchQuery) return true;
      const name = `${s.firstName} ${s.lastInitial}`.toLowerCase();
      return name.includes(searchQuery.toLowerCase()) || s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .map(s => {
      const entry = s.timeline?.find((t: any) => t.date === selectedDate || (t.day === "Today" && selectedDate === todayStr));
      
      return {
        roll: s.rollNumber,
        name: `${s.firstName} ${s.lastInitial}`,
        status: entry ? "Present" : "Absent",
        mood: entry ? entry.score : 0,
        emoji: entry ? entry.emoji : "—",
        time: entry ? (entry.time || "Checked In") : "—",
        alert: entry ? entry.alert : false,
        profilePhoto: s.profilePhoto,
        initial: s.firstName[0]
      };
    });

  const totalPages = Math.max(1, Math.ceil(studentsTable.length / itemsPerPage));
  const paginatedStudentsTable = studentsTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedDate]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Attendance Center</h1>
          <p className="text-slate-500 mt-1">Live monitoring and daily tracking.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-200 transition-colors">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <input 
              type="date" 
              className="bg-transparent outline-none cursor-pointer text-purple-700 font-bold"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Heatmap & Table */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Heatmap Card */}
          <div className="glass-card p-6 border-none">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-800 text-lg">Class Attendance Heatmap (Last 30 Days)</h2>
              <div className="flex space-x-3 text-xs font-bold text-slate-500">
                <span className="flex items-center"><div className="w-3 h-3 bg-green-200 rounded-sm mr-1"></div> Present</span>
                <span className="flex items-center"><div className="w-3 h-3 bg-red-200 rounded-sm mr-1"></div> Absent</span>
                <span className="flex items-center"><div className="w-3 h-3 bg-orange-200 rounded-sm mr-1"></div> Late</span>
                <span className="flex items-center"><div className="w-3 h-3 bg-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)] rounded-sm mr-1"></div> Alert</span>
              </div>
            </div>
            
            <div className="grid grid-cols-10 gap-2">
              {heatmapDays.map((day, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  onClick={() => setSelectedDate(day.date)}
                  className={cn(
                    "h-10 rounded-lg cursor-pointer transition-colors relative group",
                    day.type === "present" && "bg-green-100 hover:bg-green-200",
                    day.type === "absent" && "bg-red-100 hover:bg-red-200",
                    day.type === "late" && "bg-orange-100 hover:bg-orange-200",
                    day.type === "alert" && "bg-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:bg-purple-300",
                    selectedDate === day.date && "ring-2 ring-purple-500 ring-offset-2"
                  )}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-slate-800 text-white text-xs rounded-xl p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 text-center">
                    {new Date(day.date).toLocaleDateString()} <br/> 
                    <span className="text-[10px] text-slate-300">Present: {day.presentCount}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Daily Table */}
          <div className="glass-card p-6 border-none overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-800 text-lg">Daily Attendance Record <span className="text-sm font-medium text-slate-500 ml-2">({new Date(selectedDate).toLocaleDateString()})</span></h2>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400"/>
                  <input 
                    type="text" 
                    placeholder="Search student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-48 transition-all"
                  />
                </div>
                <button className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200"><Filter className="w-4 h-4"/></button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                  <tr className="text-slate-400 border-b border-slate-100 text-sm">
                    <th className="pb-3 font-medium">Student</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Mood</th>
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {paginatedStudentsTable.map((student, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden shadow-inner flex-shrink-0">
                            {student.profilePhoto ? <img src={student.profilePhoto} className="w-full h-full object-cover" /> : student.initial || student.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{student.name}</div>
                            <div className="text-xs text-slate-400">Roll: {student.roll}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-bold",
                          student.status === "Present" && "bg-green-100 text-green-700",
                          student.status === "Absent" && "bg-red-100 text-red-700",
                          student.status === "Late" && "bg-orange-100 text-orange-700"
                        )}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {student.status !== "Absent" ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{student.emoji}</span>
                            <span className="font-bold text-slate-600">{student.mood}/10</span>
                            {student.alert && <ShieldAlert className="w-4 h-4 text-red-500" />}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 text-slate-600 font-medium">{student.time}</td>
                      <td className="py-4 text-right">
                        <button className="text-slate-400 hover:text-purple-600 transition-colors"><MoreVertical className="w-5 h-5 inline-block"/></button>
                      </td>
                    </tr>
                  ))}
                  {paginatedStudentsTable.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-slate-400">No students found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {studentsTable.length > itemsPerPage && (
              <div className="flex justify-center items-center space-x-2 pt-6 border-t border-slate-100 mt-4">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 disabled:opacity-50 hover:bg-slate-50 shadow-sm transition-all"
                >
                  <span className="font-black">&lt;</span>
                </button>
                <span className="text-sm font-bold text-slate-600 px-3 bg-white py-1.5 rounded-lg shadow-sm border border-slate-100">Page {currentPage} of {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 disabled:opacity-50 hover:bg-slate-50 shadow-sm transition-all"
                >
                  <span className="font-black">&gt;</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Monitor & OTP */}
        <div className="space-y-8">
          
          {/* OTP Panel */}
          <div className={cn(
            "glass-card border-none text-white p-6 relative overflow-hidden transition-all duration-500",
            isExpired ? "bg-gradient-to-br from-slate-600 to-slate-800" : "bg-gradient-to-br from-purple-600 to-pink-500"
          )}>
            <div className="absolute top-0 right-0 p-4 opacity-20"><Key className="w-24 h-24" /></div>
            <h2 className="font-bold text-white/90 text-sm uppercase tracking-wider mb-2 relative z-10">Today's Magic Code</h2>
            
            <motion.div 
              key={magicCode}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn("text-5xl font-black tracking-widest mb-2 relative z-10", isExpired && "opacity-50 line-through")}
            >
              {magicCode}
            </motion.div>

            <div className="text-sm font-bold bg-black/20 w-fit px-3 py-1 rounded-md mb-4 relative z-10 flex items-center shadow-inner border border-white/10">
               <span className={cn("tracking-widest font-mono", isExpired ? "text-red-300" : "text-white")}>⏱ {timeLeft}</span>
            </div>

            <div className="flex items-center justify-between relative z-10 mt-2">
              <span className={cn("text-sm font-bold px-3 py-1 rounded-full", isExpired ? "bg-red-500/80 text-white" : "bg-white/20")}>
                {isExpired ? "Expired" : "Active Code"}
              </span>
              <button 
                onClick={generateNewCode} 
                className="bg-white text-purple-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-purple-50 transition-all shadow-lg active:scale-95"
              >
                Generate New
              </button>
            </div>
          </div>

          {/* Live Check-in Monitor */}
          <div className="glass-card p-6 border-none h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-800 text-lg flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Live Check-ins
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <AnimatePresence>
                {liveCheckins.length > 0 ? liveCheckins.map((checkin) => (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={checkin.id}
                    className="flex items-center p-3 bg-white/50 border border-white/60 rounded-2xl shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-2xl mr-3 shadow-inner">
                      {checkin.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">{checkin.name}</span>
                        <span className="text-xs font-bold text-slate-400">{checkin.time}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-500">Roll: {checkin.roll}</span>
                        <span className={cn("text-xs font-bold", checkin.score >= 8 ? "text-green-500" : "text-orange-500")}>Mood: {checkin.score}/10</span>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center text-slate-400 mt-10">Waiting for check-ins...</div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
