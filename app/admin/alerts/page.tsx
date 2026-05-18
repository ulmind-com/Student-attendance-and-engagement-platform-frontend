"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, HeartPulse, Clock, ArrowRight, MessageCircle,
  FileEdit, CheckCircle2, Info, X, Phone, User, Send, BookOpen, BadgeCheck, Search, Loader2, Printer
} from "lucide-react";
import { cn } from "@/lib/utils";

type Alert = {
  id: string;
  student: string;
  roll: string;
  avatar: string;
  type: string;
  priority: string;
  emoji: string;
  score: number;
  description: string;
  aiSuggestion: string;
  time: string;
  status: "New" | "Reviewed" | "Resolved";
  parentsPhone?: string;
  parentsName?: string;
  resolved?: boolean;
  date: string;
  profilePhoto?: string;
};

const formatDateSafe = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    // mm/dd/yyyy format safely
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
  }
  return dateStr;
};

export default function AlertsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRoll, setSelectedRoll] = useState<string | null>(null);

  // Debounced Search API Call
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowDropdown(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Modal states
  const [criticalModal, setCriticalModal] = useState(false);
  const [reviewModal, setReviewModal] = useState<Alert | null>(null);
  const [contactModal, setContactModal] = useState<Alert | null>(null);

  // Review note form
  const [note, setNote] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  useEffect(() => {
    fetchStudents();
  }, []);

  const alerts = useMemo(() => {
    return students
      .filter((s: any) => {
        const entry = s.timeline?.find((t: any) => t.date === selectedDate || (t.day === "Today" && selectedDate === todayStr));
        if (!entry) return false;
        
        // If a specific student is selected, only show their alerts
        if (selectedRoll && s.rollNumber !== selectedRoll) {
          return false;
        }
        
        return entry.alert || entry.resolved;
      })
      .map((s: any): Alert => {
        const entry = s.timeline?.find((t: any) => t.date === selectedDate || (t.day === "Today" && selectedDate === todayStr));
        let priority = "Low";
        if (entry.score <= 3) priority = "High";
        else if (entry.score <= 5 || entry.alert) priority = "Medium";

        let aiSuggestion = "Talk privately during lunch break.";
        if (priority === "High") aiSuggestion = "Immediate counselor review recommended. Student reported feeling very low.";
        else if (entry?.emoji === "😴") aiSuggestion = "Send a gentle notification to parents to check morning routine.";
        else if (entry?.emoji === "🤒") aiSuggestion = "Monitor student during class and ensure they drink water.";

        return {
          id: s.rollNumber,
          student: `${s.firstName} ${s.lastInitial}`,
          roll: s.rollNumber,
          avatar: s.firstName[0],
          profilePhoto: s.profilePhoto,
          type: "Emotional",
          priority,
          emoji: entry?.emoji ?? "⚠️",
          score: entry?.score ?? 0,
          description: `Student checked in with a low score (${entry?.score}/10) and requires attention.`,
          aiSuggestion,
          time: entry?.time || "Recently",
          status: entry?.resolved ? "Resolved" as const : "New" as const,
          parentsName: s.parentsName || "",
          parentsPhone: s.parentsPhone || "",
          resolved: entry?.resolved || false,
          date: entry?.date || selectedDate
        };
      });
  }, [students, selectedDate, searchQuery, selectedRoll]);

  const totalPages = Math.max(1, Math.ceil(alerts.length / itemsPerPage));
  const paginatedAlerts = alerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [selectedDate, searchQuery, selectedRoll]);

  const heatmapDays = useMemo(() => {
    const days = [];
    for(let i=29; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      let alertsCount = 0;
      students.forEach(s => {
        if (selectedRoll && s.rollNumber !== selectedRoll) return;
        const entry = s.timeline?.find((t: any) => t.date === dateStr || (t.day === "Today" && dateStr === todayStr));
        if (entry && (entry.alert || entry.resolved)) alertsCount++;
      });

      days.push({ date: dateStr, count: alertsCount });
    }
    return days;
  }, [students]);

  const handleMarkResolved = async (alertId: string, exactDate: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${alertId}/resolve-alert?date=${exactDate}`, {
        method: "PATCH"
      });
      if (res.ok) {
        showToast("✅ Alert marked as resolved! Student is now safe.");
        // Refetch to get updated timeline
        fetchStudents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNote = () => {
    if (!reviewModal) return;
    // Note saving logic could go here, for now we just update locally if needed
    setNote("");
    setReviewModal(null);
    showToast("📝 Note saved successfully.");
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const rowsHtml = alerts.map(a => {
      const s = students.find(x => x.rollNumber === a.roll);
      const pClass = a.priority === 'High' ? 'priority-high' : a.priority === 'Medium' ? 'priority-med' : 'priority-low';
      const sClass = a.resolved ? 'status-resolved' : 'status-new';
      return `
        <tr>
          <td>
            <div class="student-name">${a.student}</div>
            <div class="student-meta">Roll: ${a.roll}</div>
          </td>
          <td style="font-weight: bold; color: #475569;">
            ${s?.className || 'N/A'} - ${s?.section || 'N/A'}
          </td>
          <td style="font-weight: bold;">${a.time}</td>
          <td>
            <div class="score ${pClass}">${a.score}/10 ${a.emoji}</div>
            <div class="student-meta">${a.priority} Priority</div>
          </td>
          <td>
            <div class="alert-desc">${a.description}</div>
            <div class="ai-desc">AI Note: ${a.aiSuggestion}</div>
          </td>
          <td class="${sClass}">
            ${a.resolved ? '✓ Resolved' : '⚠ Action Needed'}
          </td>
        </tr>
      `;
    }).join('');

    const emptyHtml = alerts.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: 30px; font-weight:bold; color:#94a3b8;">No alerts found for this selection.</td></tr>' : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Wellness Alerts</title>
          <style>
            @page { size: letter portrait; margin: 0.5in; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              padding: 0; 
              margin: 0; 
              color: #0f172a;
            }
            .container { padding: 20px; max-width: 100%; margin: 0 auto; }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding-bottom: 15px; 
              border-bottom: 2px solid #e2e8f0;
            }
            .header h2 { 
              margin: 0 0 10px 0; 
              font-size: 28px; 
              font-weight: 900; 
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header p { 
              margin: 0; 
              color: #64748b; 
              font-size: 14px; 
              font-weight: bold;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
            }
            th { 
              background: #f8fafc; 
              padding: 12px; 
              text-align: left; 
              font-size: 12px; 
              text-transform: uppercase; 
              font-weight: 900; 
              color: #475569; 
              border: 1px solid #cbd5e1; 
            }
            td { 
              padding: 12px; 
              border: 1px solid #e2e8f0; 
              font-size: 14px; 
            }
            .student-name { font-weight: 800; color: #1e293b; font-size: 16px; margin-bottom: 4px; }
            .student-meta { color: #64748b; font-size: 12px; font-weight: 600; }
            .score { font-weight: 900; font-size: 16px; display: flex; align-items: center; gap: 5px; }
            .priority-high { color: #dc2626; }
            .priority-med { color: #ea580c; }
            .priority-low { color: #ca8a04; }
            .status-resolved { color: #16a34a; font-weight: bold; }
            .status-new { color: #dc2626; font-weight: bold; }
            .alert-desc { font-weight: 700; color: #334155; margin-bottom: 4px; }
            .ai-desc { font-size: 12px; color: #64748b; font-style: italic; }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              font-size: 12px; 
              color: #94a3b8; 
              border-top: 1px solid #e2e8f0; 
              padding-top: 10px; 
            }
            .print-btn {
              display: block;
              width: 200px;
              margin: 20px auto;
              padding: 12px 24px;
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
            }
            @media print {
              .print-btn { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <button class="print-btn" onclick="window.print()">🖨️ Print Document</button>
            <div class="header">
              <h2>Smart Alerts Report</h2>
              <p>Date: ${formatDateSafe(selectedDate)} ${searchQuery && selectedRoll ? `| Student: ${searchQuery} (Roll: ${selectedRoll})` : ''}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Class / Section</th>
                  <th>Time</th>
                  <th>Rating</th>
                  <th style="width: 35%">Alert Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
                ${emptyHtml}
              </tbody>
            </table>
            <div class="footer">
              Generated by Student Attendance and Engagement Platform &bull; ${new Date().toLocaleString()}
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const highPriorityAlerts = alerts.filter(a => a.priority === "High");
  const resolvedCount = alerts.filter(a => a.resolved).length;
  const activeAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="space-y-8 relative">

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-slate-800/95 backdrop-blur-md text-white rounded-full shadow-2xl flex items-center space-x-3 border border-white/10"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            Smart Alerts
            {activeAlerts.length > 0 && (
              <span className="ml-3 bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                {activeAlerts.length} Active
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-1">Emotionally intelligent notifications requiring attention.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative z-50">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400"/>
            <input 
              type="text" 
              placeholder="Search student or roll..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedRoll) setSelectedRoll(null);
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setShowDropdown(true);
              }}
              className="pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64 transition-all shadow-sm font-medium"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 absolute right-3 top-3.5 text-purple-500 animate-spin" />
            )}
            {searchQuery && !isSearching && (
              <X 
                className="w-4 h-4 absolute right-3 top-3.5 text-slate-400 cursor-pointer hover:text-slate-600" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRoll(null);
                  setShowDropdown(false);
                }} 
              />
            )}

            {/* Premium Spotlight Dropdown */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 right-0 w-full sm:w-[350px] bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl overflow-hidden z-[100]"
                >
                  {searchResults.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm font-bold">No matching students found.</p>
                      <p className="text-xs mt-1">Try a different name or roll number.</p>
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                      <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Suggestions</div>
                      {searchResults.map((res) => (
                        <div 
                          key={res.rollNumber}
                          onClick={() => {
                            setSelectedRoll(res.rollNumber);
                            setSearchQuery(res.fullName);
                            setShowDropdown(false);
                          }}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors border border-transparent hover:border-purple-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-lg shadow-sm border border-white">
                              {res.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{res.fullName}</p>
                              <p className="text-xs text-slate-500 font-medium">Roll: {res.rollNumber} &bull; {res.className}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xl">{res.emotion}</span>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full mt-1",
                              res.emotionScore <= 3 ? "bg-red-100 text-red-600" : res.emotionScore <= 5 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                            )}>
                              {res.emotionScore}/10
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-200 transition-colors shadow-sm">
            <Clock className="w-4 h-4 mr-2" />
            <input 
              type="date" 
              className="bg-transparent outline-none cursor-pointer text-purple-700 font-bold"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={todayStr}
            />
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Printer className="w-4 h-4 mr-2" /> Print PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Alerts List & Heatmap */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Heatmap Section */}
          <div className="glass-card p-6 border-none">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-800 text-lg">Alert Frequency (Last 30 Days)</h2>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {heatmapDays.map((day, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  onClick={() => setSelectedDate(day.date)}
                  className={cn(
                    "h-10 rounded-lg cursor-pointer transition-colors relative group",
                    day.count === 0 && "bg-slate-100 hover:bg-slate-200",
                    day.count > 0 && day.count < 3 && "bg-orange-100 hover:bg-orange-200",
                    day.count >= 3 && "bg-red-200 shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:bg-red-300",
                    selectedDate === day.date && "ring-2 ring-purple-500 ring-offset-2"
                  )}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-800 text-white text-xs rounded-xl p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 text-center">
                    {formatDateSafe(day.date)} <br/> 
                    <span className="text-slate-300">{day.count} Alert(s)</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {alerts.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center text-slate-500 border-none">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-400 opacity-50" />
                <p className="font-bold text-lg">All clear! No alerts right now.</p>
                <p className="text-sm mt-1">For {formatDateSafe(selectedDate)}, your class is doing great.</p>
              </motion.div>
            ) : paginatedAlerts.map((alert, i) => {
              const isResolved = alert.resolved;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={alert.id}
                  className={cn(
                    "glass-card p-6 border-none relative overflow-hidden transition-all hover:shadow-lg",
                    isResolved
                      ? "bg-green-50/70 border border-green-100"
                      : alert.priority === "High" ? "bg-red-50/80 hover:bg-red-50"
                      : alert.priority === "Medium" ? "bg-orange-50/80 hover:bg-orange-50"
                      : "bg-yellow-50/80 hover:bg-yellow-50"
                  )}
                >
                  {/* Status Badge */}
                  {isResolved ? (
                    <div className="absolute top-4 right-4 flex items-center space-x-1 text-xs font-bold text-green-600">
                      <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-100" />
                      <span className="text-blue-600">RESOLVED</span>
                    </div>
                  ) : alert.status === "New" ? (
                    <div className="absolute top-4 right-4 flex items-center space-x-1 text-xs font-bold text-red-500 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span>NEW</span>
                    </div>
                  ) : alert.status === "Reviewed" ? (
                    <div className="absolute top-4 right-4 flex items-center space-x-1 text-xs font-bold text-blue-500">
                      <BookOpen className="w-4 h-4" />
                      <span>REVIEWED</span>
                    </div>
                  ) : null}

                  <div className="flex items-start space-x-4">
                    {/* Avatar / Photo */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center font-bold text-slate-700 text-2xl shadow-sm border border-slate-100 overflow-hidden">
                        {alert.profilePhoto
                          ? <img src={alert.profilePhoto} className="w-full h-full object-cover" alt={alert.student} />
                          : <span className="text-2xl">{isResolved ? "😊" : alert.emoji}</span>
                        }
                      </div>
                      {alert.profilePhoto && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-sm shadow-sm">
                          {isResolved ? "😊" : alert.emoji}
                        </div>
                      )}
                      {isResolved && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h2 className="text-xl font-bold text-slate-800">{alert.student}</h2>
                        <span className="text-sm font-medium text-slate-500">Roll: {alert.roll}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-xs font-bold",
                          "bg-purple-100 text-purple-700"
                        )}>{alert.type} Alert</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm font-bold mb-3">
                        <span className={cn(
                          isResolved ? "text-green-600"
                          : alert.priority === "High" ? "text-red-600"
                          : alert.priority === "Medium" ? "text-orange-600"
                          : "text-yellow-600"
                        )}>
                          {isResolved ? "✅ Problem Solved" : `Score: ${alert.score}/10`}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 flex items-center"><Clock className="w-3 h-3 mr-1" /> {alert.time}</span>
                      </div>

                      <p className={cn("font-medium mb-4", isResolved ? "text-green-700 line-through opacity-60" : "text-slate-700")}>
                        {alert.description}
                      </p>

                      {/* AI Suggestion Box */}
                      {!isResolved && (
                        <div className="bg-white/60 rounded-xl p-3 border border-white mb-5 flex items-start space-x-3">
                          <div className="bg-purple-100 p-1.5 rounded-lg mt-0.5">
                            <HeartPulse className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-0.5">AI Suggestion</div>
                            <div className="text-sm text-slate-700 font-medium">{alert.aiSuggestion}</div>
                          </div>
                        </div>
                      )}

                      {isResolved ? (
                        <div className="flex items-center space-x-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
                          <BadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <span className="text-sm font-bold text-blue-700">Student's emotional concern has been resolved and marked safe. ✨</span>
                        </div>
                      ) : (
                        /* Actions */
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => setReviewModal(alert)}
                            className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
                          >
                            <FileEdit className="w-4 h-4 mr-2" /> Review & Note
                          </button>
                          <button
                            onClick={() => setContactModal(alert)}
                            className="flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" /> Contact Parent
                          </button>
                          <button
                            onClick={() => handleMarkResolved(alert.id, alert.date)}
                            className="flex items-center px-4 py-2 text-green-600 bg-green-50 border border-green-100 hover:bg-green-100 rounded-xl text-sm font-bold transition-all active:scale-95 ml-auto"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Resolved
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Pagination Controls */}
          {alerts.length > itemsPerPage && (
            <div className="flex justify-center items-center space-x-2 pt-4 mt-4 border-t border-slate-100">
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

        {/* Right Sidebar: AI Analytics & Recommendations */}
        <div className="space-y-6">
          {/* Emergency Protocol Box */}
          {activeAlerts.length > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-6 border-none bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl shadow-red-500/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold">Emergency Protocol</h2>
              </div>
              <p className="text-red-50 font-medium mb-6">
                There are {activeAlerts.length} students requiring attention on this date.
              </p>
              <button
                onClick={() => setCriticalModal(true)}
                className="w-full py-3 bg-white text-red-600 font-bold rounded-xl shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center active:scale-95"
              >
                View Critical Cases <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          )}

          {/* Quick Analytics */}
          <div className="glass-card p-6 border-none bg-white/70">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Info className="w-4 h-4 mr-2 text-slate-400" /> Weekly Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Total Alerts</span>
                <span className="font-bold text-slate-800">{alerts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Resolved</span>
                <span className="font-bold text-green-600 flex items-center">
                  {resolvedCount > 0 && <BadgeCheck className="w-4 h-4 text-blue-500 mr-1" />}
                  {resolvedCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">High Priority</span>
                <span className="font-bold text-red-600">{highPriorityAlerts.length}</span>
              </div>
            </div>
            {resolvedCount > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center space-x-2">
                <BadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-xs font-bold text-blue-700">{resolvedCount} student(s) marked safe today!</span>
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Common Triggers</div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600">Low Mood Score</span>
                <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600">Sad Emoji</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MODALS ============ */}
      <AnimatePresence>

        {/* View Critical Cases Modal */}
        {criticalModal && (
          <Modal onClose={() => setCriticalModal(false)} title="🚨 Critical Cases" large>
            <div className="space-y-4">
              <p className="text-sm text-slate-500 font-medium">These students require emotional support or counselor intervention.</p>
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center p-4 bg-red-50 rounded-2xl border border-red-100 space-x-4">
                  <div className="w-12 h-12 rounded-full bg-white text-2xl flex items-center justify-center shadow-sm border border-red-100">{alert.emoji}</div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">{alert.student} <span className="text-xs text-slate-400 ml-1">Roll: {alert.roll}</span></div>
                    <div className="text-sm text-red-600 font-medium mt-0.5">{alert.description}</div>
                    <div className="mt-2 text-xs bg-white border border-red-100 rounded-lg px-3 py-2 text-purple-700 font-medium">
                      💡 {alert.aiSuggestion}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-red-600">{alert.score}</div>
                    <div className="text-xs text-slate-400">/ 10</div>
                  </div>
                </div>
              ))}
              {activeAlerts.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p className="font-bold">All critical cases resolved!</p>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Review & Note Modal */}
        {reviewModal && (
          <Modal onClose={() => setReviewModal(null)} title="📋 Review & Note">
            <div className="space-y-5">
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-white text-2xl flex items-center justify-center shadow-sm">{reviewModal.emoji}</div>
                <div>
                  <div className="font-bold text-slate-800">{reviewModal.student}</div>
                  <div className="text-sm text-slate-500">Roll: {reviewModal.roll} • Score: {reviewModal.score}/10</div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">What Happened</div>
                <p className="text-sm text-slate-700 font-medium">{reviewModal.description}</p>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">AI Recommendation</div>
                <p className="text-sm text-slate-700 font-medium">{reviewModal.aiSuggestion}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Your Private Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add your observation or action plan for this student..."
                  rows={4}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-400 resize-none text-sm font-medium text-slate-700"
                />
              </div>

              <button
                onClick={handleSaveNote}
                className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4 mr-2" /> Save Note & Mark Reviewed
              </button>
            </div>
          </Modal>
        )}

        {/* Contact Parent Modal */}
        {contactModal && (
          <Modal onClose={() => setContactModal(null)} title="📞 Contact Parent">
            <div className="space-y-5">
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-200 to-pink-200 text-xl flex items-center justify-center font-bold text-purple-700 shadow-sm">
                  {contactModal.avatar}
                </div>
                <div>
                  <div className="font-bold text-slate-800">{contactModal.student}</div>
                  <div className="text-sm text-slate-500">Roll: {contactModal.roll}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <User className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Parent Name</div>
                    <div className="font-bold text-slate-700">{contactModal.parentsName || "Not provided"}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Phone Number</div>
                    <div className="font-bold text-slate-700">{contactModal.parentsPhone || "Not provided"}</div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                <div className="text-xs font-bold text-orange-600 uppercase mb-1">Reason for Contact</div>
                <p className="text-sm text-slate-700 font-medium">{contactModal.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={contactModal.parentsPhone ? `tel:${contactModal.parentsPhone}` : "#"}
                  className="flex items-center justify-center py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 active:scale-95 transition-all shadow-sm"
                >
                  <Phone className="w-4 h-4 mr-2" /> Call Now
                </a>
                <button
                  onClick={() => {
                    setContactModal(null);
                    showToast("📲 Parent notification sent!");
                  }}
                  className="flex items-center justify-center py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                >
                  <Send className="w-4 h-4 mr-2" /> Send Alert
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable Modal
function Modal({ children, onClose, title, large = false }: {
  children: React.ReactNode; onClose: () => void; title: string; large?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={cn("bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-h-[90vh] flex flex-col", large ? "max-w-2xl" : "max-w-md")}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  );
}
