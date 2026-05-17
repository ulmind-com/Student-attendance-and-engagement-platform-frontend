"use client";
import { useState, useEffect } from "react";
import { SectionHeader, SettingsCard } from "./shared";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Search, History, Users, Printer, KeyRound, CheckCircle2, ShieldAlert, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OTPPanel() {
  const [activeTab, setActiveTab] = useState<"manage" | "history">("manage");
  const [students, setStudents] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");
  const [search, setSearch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual generation state
  const [manualRoll, setManualRoll] = useState("");
  const [customOtp, setCustomOtp] = useState("");
  const [manualSearchTerm, setManualSearchTerm] = useState("");
  const [selectedManualStudent, setSelectedManualStudent] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expirationValue, setExpirationValue] = useState(3);
  const [expirationUnit, setExpirationUnit] = useState("Months");
  const [timeRangeEnabled, setTimeRangeEnabled] = useState(false);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [toast, setToast] = useState<{show: boolean; msg: string}>({show: false, msg: ""});

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const fetchData = async () => {
    try {
      const timestamp = Date.now();
      const [listRes, histRes, confRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/otps/list?t=${timestamp}`, { cache: 'no-store' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/otps/history?t=${timestamp}`, { cache: 'no-store' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/otp-config?t=${timestamp}`, { cache: 'no-store' })
      ]);
      if (listRes.ok) setStudents(await listRes.json());
      if (histRes.ok) setHistory(await histRes.json());
      if (confRes.ok) {
        const conf = await confRes.json();
        const hours = conf.expiration_hours;
        if (hours % 8760 === 0 && hours >= 8760) {
          setExpirationValue(hours / 8760);
          setExpirationUnit("Years");
        } else if (hours % 720 === 0 && hours >= 720) {
          setExpirationValue(hours / 720);
          setExpirationUnit("Months");
        } else if (hours % 24 === 0 && hours >= 24) {
          setExpirationValue(hours / 24);
          setExpirationUnit("Days");
        } else {
          setExpirationValue(hours || 24);
          setExpirationUnit("Hours");
        }
        setTimeRangeEnabled(conf.time_range_enabled);
        setStartTime(conf.start_time);
        setEndTime(conf.end_time);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerateGroup = async () => {
    setIsGenerating(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/otps/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: selectedClass === "All" ? "all" : "class",
          class_name: selectedClass !== "All" ? selectedClass : undefined,
          section_name: selectedSection !== "All" ? selectedSection : undefined,
        })
      });
      await fetchData();
    } catch (e) {}
    setIsGenerating(false);
  };

  const handleGenerateStudent = async (roll: string, custom?: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/otps/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "student",
          roll_number: roll,
          custom_otp: custom || undefined
        })
      });
      if (roll === manualRoll) { 
        setManualRoll(""); 
        setCustomOtp(""); 
        setManualSearchTerm("");
        setSelectedManualStudent(null);
      }
      await fetchData();
    } catch (e) {}
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      let multiplier = 1;
      if (expirationUnit === "Years") multiplier = 8760;
      if (expirationUnit === "Months") multiplier = 720;
      if (expirationUnit === "Days") multiplier = 24;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/otp-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          expiration_hours: expirationValue * multiplier,
          time_range_enabled: timeRangeEnabled,
          start_time: startTime,
          end_time: endTime
        })
      });
      await fetchData();
      showToast("OTP configuration saved successfully!");
    } catch (e) {}
    setIsSavingConfig(false);
  };

  // Get unique classes and sections
  const classes = ["All", ...Array.from(new Set(students.map(s => s.className)))];
  const sections = ["All", ...Array.from(new Set(students.filter(s => selectedClass === "All" || s.className === selectedClass).map(s => s.section)))];

  const filteredStudents = students.filter(s => {
    if (selectedClass !== "All" && s.className !== selectedClass) return false;
    if (selectedSection !== "All" && s.section !== selectedSection) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.rollNumber.includes(search)) return false;
    return true;
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student OTP List</title>
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
              font-weight: 600; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            th, td { 
              padding: 14px 16px; 
              border-bottom: 1px solid #cbd5e1; 
              text-align: left; 
            }
            th { 
              background-color: #f8fafc; 
              font-weight: 800; 
              text-transform: uppercase; 
              font-size: 12px; 
              color: #64748b;
              border-bottom: 2px solid #cbd5e1;
            }
            tr:nth-child(even) { background-color: #f8fafc; }
            .name-cell { font-weight: 700; font-size: 15px; }
            .meta-cell { font-size: 13px; color: #475569; }
            .otp-code { 
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; 
              font-size: 18px; 
              font-weight: 900; 
              letter-spacing: 3px; 
              color: #ea580c; 
              background-color: #fff7ed;
              padding: 4px 12px;
              border-radius: 6px;
              border: 1px solid #ffedd5;
              display: inline-block;
            }
            .status-tag {
              font-size: 11px;
              font-weight: 800;
              padding: 4px 10px;
              border-radius: 20px;
              text-transform: uppercase;
            }
            .status-active { background: #dcfce7; color: #166534; }
            .status-used { background: #f1f5f9; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Student Magic Codes</h2>
              <p>Class: ${selectedClass} | Section: ${selectedSection} &bull; Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Class & Section</th>
                  <th>Magic Code</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredStudents.map(s => `
                  <tr>
                    <td class="name-cell">${s.name}</td>
                    <td class="meta-cell">${s.rollNumber}</td>
                    <td class="meta-cell">${s.className} - ${s.section}</td>
                    <td><span class="otp-code">${s.otp?.code || "----"}</span></td>
                    <td>
                      <span class="status-tag ${s.otp?.used ? 'status-used' : 'status-active'}">
                        ${s.otp?.used ? 'Terminated' : 'Active'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Give it a moment to render styles
    setTimeout(() => {
      printWindow.print();
      // Only close if it's not the current window
      // printWindow.close(); 
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl relative">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-orange-500/20 font-black text-sm flex items-center gap-3 border border-orange-400/30"
          >
            <CheckCircle2 className="w-5 h-5 text-orange-100" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <SectionHeader title="Unique OTP Management" description="Manage dynamic one-time passwords for individual students." />
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-max shadow-inner">
        <button onClick={() => setActiveTab("manage")} className={cn("px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2", activeTab === "manage" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700")} >
          <KeyRound className="w-4 h-4" /> Manage OTPs
        </button>
        <button onClick={() => setActiveTab("history")} className={cn("px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2", activeTab === "history" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700")} >
          <History className="w-4 h-4" /> OTP History
        </button>
      </div>

      {activeTab === "manage" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
          
          {/* OTP Global Config */}
          <SettingsCard className="bg-orange-50 border-orange-100 flex flex-col gap-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-200/50 pb-5">
              <div>
                <h4 className="text-sm font-black text-orange-800 flex items-center gap-2"><History className="w-4 h-4"/> Auto-Expiration Timer</h4>
                <p className="text-xs font-bold text-orange-600/70 mt-1">Set how long until an OTP expires and regenerates automatically.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-orange-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-400 transition-all shadow-sm">
                  <input 
                    type="number" 
                    min="1"
                    value={expirationValue} 
                    onChange={e => setExpirationValue(Number(e.target.value))} 
                    className="w-20 px-4 py-2 font-black text-orange-700 text-center outline-none bg-transparent"
                  />
                  <select 
                    value={expirationUnit} 
                    onChange={e => setExpirationUnit(e.target.value)}
                    className="px-4 py-2 bg-orange-50 border-l border-orange-200 text-sm font-bold text-orange-800 outline-none cursor-pointer"
                  >
                    <option value="Hours">Hours</option>
                    <option value="Days">Days</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-orange-800 flex items-center gap-2"><Clock className="w-4 h-4"/> Active Time Range</h4>
                <p className="text-xs font-bold text-orange-600/70 mt-1">Define the specific time window when students can use OTPs to log in.</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setTimeRangeEnabled(!timeRangeEnabled)}
                  className={cn("w-12 h-6 rounded-full transition-all relative flex-shrink-0 shadow-inner", timeRangeEnabled ? "bg-orange-500" : "bg-slate-300")}
                >
                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", timeRangeEnabled ? "right-1" : "left-1")} />
                </button>
                
                {timeRangeEnabled && (
                  <div className="flex items-center gap-2">
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm font-bold text-orange-800 outline-none focus:ring-2 focus:ring-orange-400 shadow-sm" />
                    <span className="text-orange-400 font-bold">to</span>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm font-bold text-orange-800 outline-none focus:ring-2 focus:ring-orange-400 shadow-sm" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-orange-200/50 mt-2">
              <button onClick={handleSaveConfig} disabled={isSavingConfig} className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-6 py-2 rounded-xl font-black text-sm shadow-md shadow-orange-200 transition-all flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {isSavingConfig ? "Saving..." : "Save Configuration"}
              </button>
            </div>
            
          </SettingsCard>

          {/* Controls */}
          <SettingsCard>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Class</label>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500">
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Section</label>
                <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500">
                  {sections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1 space-y-2 relative">
                <label className="text-xs font-bold text-slate-500 uppercase">Search</label>
                <input type="text" placeholder="Search name/roll..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500" />
                <Search className="absolute left-3 bottom-3 w-4 h-4 text-slate-400" />
              </div>
              <button onClick={handleGenerateGroup} disabled={isGenerating} className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-black shadow-lg shadow-orange-200 flex items-center gap-2 transition-all">
                <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                Auto Generate
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 items-start relative">
              <div className="flex-1 space-y-2 relative">
                <label className="text-xs font-bold text-slate-500 uppercase">Search Student for OTP Assignment</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type student name to search..." 
                    value={manualSearchTerm} 
                    onChange={e => {
                      setManualSearchTerm(e.target.value);
                      setShowSuggestions(true);
                      setSelectedManualStudent(null);
                      setManualRoll("");
                    }} 
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500" 
                  />
                  {showSuggestions && manualSearchTerm && !selectedManualStudent && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-[100] max-h-48 overflow-y-auto">
                      {students.filter(s => s.name.toLowerCase().includes(manualSearchTerm.toLowerCase())).slice(0, 5).map(s => (
                        <div 
                          key={s.rollNumber} 
                          onClick={() => {
                            setSelectedManualStudent(s);
                            setManualRoll(s.rollNumber);
                            setManualSearchTerm(s.name);
                            setShowSuggestions(false);
                          }}
                          className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                        >
                          <div className="font-bold text-slate-800">{s.name}</div>
                          <div className="text-xs text-slate-500 font-medium">{s.className} - {s.section} &bull; Roll: {s.rollNumber}</div>
                        </div>
                      ))}
                      {students.filter(s => s.name.toLowerCase().includes(manualSearchTerm.toLowerCase())).length === 0 && (
                        <div className="px-4 py-3 text-sm text-slate-500 font-bold">No students found.</div>
                      )}
                    </div>
                  )}
                </div>
                
                {selectedManualStudent && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl animate-in fade-in zoom-in-95">
                    <div className="text-[10px] text-orange-600 font-black uppercase tracking-wider mb-1">Selected Student</div>
                    <div className="font-black text-orange-900">{selectedManualStudent.name}</div>
                    <div className="text-sm text-orange-800 mt-1 flex gap-4">
                      <span><span className="font-medium opacity-70">Class:</span> {selectedManualStudent.className}</span>
                      <span><span className="font-medium opacity-70">Sec:</span> {selectedManualStudent.section}</span>
                      <span><span className="font-medium opacity-70">Roll:</span> {selectedManualStudent.rollNumber}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full md:w-48 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Custom OTP (Optional)</label>
                <input type="text" placeholder="e.g. 1234" value={customOtp} onChange={e => setCustomOtp(e.target.value)} maxLength={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="w-full md:w-48 space-y-2">
                <label className="text-xs font-bold opacity-0 hidden md:block">Assign</label>
                <button 
                  onClick={() => handleGenerateStudent(manualRoll, customOtp)} 
                  disabled={!manualRoll} 
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black shadow-lg disabled:opacity-50 transition-all flex justify-center items-center h-[46px]"
                >
                  Assign OTP
                </button>
              </div>
            </div>
          </SettingsCard>

          <div className="flex justify-between items-center mb-2">
            <h3 className="font-black text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-orange-500" /> Students ({filteredStudents.length})</h3>
            <button onClick={handlePrint} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-2 text-sm transition-all shadow-sm">
              <Printer className="w-4 h-4" /> Print PDF (Letter Size)
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-black text-slate-500">
                  <th className="p-4">Name</th>
                  <th className="p-4">Roll No</th>
                  <th className="p-4">Class/Sec</th>
                  <th className="p-4">Current OTP</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredStudents.map(student => (
                    <motion.tr key={student.rollNumber} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden shadow-inner flex-shrink-0">
                            {student.profilePhoto ? <img src={student.profilePhoto} className="w-full h-full object-cover" /> : student.initial || student.name[0]}
                          </div>
                          <span className="font-bold text-slate-800">{student.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm text-slate-500">{student.rollNumber}</td>
                      <td className="p-4 font-bold text-sm text-slate-600">{student.className} - {student.section}</td>
                      <td className="p-4">
                        <span className="font-mono text-lg font-black tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-200/50">
                          {student.otp?.code || "----"}
                        </span>
                      </td>
                      <td className="p-4">
                        {student.otp?.used ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> Terminated</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 text-green-600 px-2 py-1 rounded-full"><ShieldAlert className="w-3 h-3" /> Active</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleGenerateStudent(student.rollNumber)} className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                          Regenerate
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">No students found.</td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
          <SettingsCard>
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><History className="w-5 h-5 text-orange-500" /> Daily OTP Usage Log</h3>
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-black text-slate-500">
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">OTP Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.map((log, i) => (
                    <tr key={i}>
                      <td className="p-4">
                        <div className="font-bold text-sm text-slate-800">{log.date}</div>
                        <div className="text-xs text-slate-400 font-medium">{new Date(log.time).toLocaleTimeString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-sm text-slate-700">{log.studentName}</div>
                        <div className="font-mono text-xs text-slate-400">{log.className} &bull; Roll: {log.rollNumber}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm font-black tracking-widest text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md line-through">
                          {log.otp}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr><td colSpan={3} className="p-8 text-center text-slate-400 font-bold">No history available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </SettingsCard>
        </div>
      )}
    </div>
  );
}
