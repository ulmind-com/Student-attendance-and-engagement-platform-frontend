"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MoreVertical, ShieldAlert, HeartPulse, ShieldCheck, UserPlus, Upload, X, Save, CheckCircle2, MousePointerClick, Users, AlertTriangle, BarChart2, Lightbulb, ClipboardList, Pencil, AlertOctagon, Calendar, UserCheck, UserX, ChevronLeft, ChevronRight, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaveSuccess } from "../SaveSuccessProvider";

// Mock Data structure for typing
type TimelineEntry = { day: string, emoji: string, score: number, alert?: boolean };
type Student = {
  id?: string;
  firstName: string;
  lastInitial: string;
  rollNumber: string;
  class_name: string;
  class?: string;
  section?: string;
  parentsName?: string;
  parentsPhone?: string;
  bloodGroup?: string;
  profilePhoto?: string;
  attendance: number;
  risk: string;
  parentStatus: string;
  timeline: TimelineEntry[];
  status?: string; // "active" | "inactive"
  parentConsentUrl?: string;
};
type AttendanceRecord = { roll_number: string; name: string; status: string; score: number; emoji: string; risk: string; alert: boolean; date: string; timestamp: string };
type DateEntry = { date: string; count: number };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive" | "today" | "calendar">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  // Calendar & Attendance state
  const [attendanceDates, setAttendanceDates] = useState<DateEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dateRecords, setDateRecords] = useState<AttendanceRecord[]>([]);

  // Consent Upload state
  const [isUploadingConsent, setIsUploadingConsent] = useState(false);
  const consentFileInputRef = useRef<HTMLInputElement>(null);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState({ 
    firstName: "", lastInitial: "", rollNumber: "", class_name: "Nursery", section: "A", 
    parentsName: "", parentsPhone: "", bloodGroup: "", profilePhoto: "" 
  });

  const { showSaveSuccess } = useSaveSuccess();

  const fetchStudents = async () => {
    try {
      // If backend is not available, we could fallback, but we assume it's running
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
    fetchTodayAttendance();
    fetchAttendanceDates();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/by-date`);
      if (res.ok) { const d = await res.json(); setTodayRecords(d.records || []); }
    } catch {}
  };

  const fetchAttendanceDates = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/dates`);
      if (res.ok) { const d = await res.json(); setAttendanceDates(d); }
    } catch {}
  };

  const fetchDateRecords = async (date: string) => {
    setSelectedDate(date);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/by-date?date=${date}`);
      if (res.ok) { const d = await res.json(); setDateRecords(d.records || []); }
    } catch {}
  };

  const toggleStatus = async (roll: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${roll}/toggle-status`, { method: "PATCH" });
      if (res.ok) { fetchStudents(); showSaveSuccess("Status updated!"); }
    } catch {}
  };

  const activeStudents = students.filter(s => s.status !== "inactive");
  const inactiveStudents = students.filter(s => s.status === "inactive");

  const getFilteredList = () => {
    let list = activeTab === "active" ? activeStudents : activeTab === "inactive" ? inactiveStudents : students;
    if (searchTerm) list = list.filter(s => s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNumber.includes(searchTerm));
    return list;
  };
  const filteredStudents = getFilteredList();
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when search or tab changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm, activeTab]);


  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, class_name: `${formData.class_name}-${formData.section}` };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({ firstName: "", lastInitial: "", rollNumber: "", class_name: "Nursery", section: "A", parentsName: "", parentsPhone: "", bloodGroup: "", profilePhoto: "" });
        fetchStudents();
        showSaveSuccess("Student added! 🎉");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentToEdit.rollNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentToEdit),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchStudents();
        // Update selected student if it's the one being edited
        if (selectedStudent?.rollNumber === studentToEdit.rollNumber) {
          setSelectedStudent(studentToEdit);
        }
        showSaveSuccess("Profile updated! ✨");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteStudent = async (rollNumber: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${rollNumber}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (selectedStudent?.rollNumber === rollNumber) setSelectedStudent(null);
        fetchStudents();
        showSaveSuccess("Student deleted! 🗑️");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/upload_csv`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setIsCsvModalOpen(false);
        fetchStudents();
        showSaveSuccess("CSV imported! 📊");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConsentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedStudent) return;
    const file = e.target.files[0];
    setIsUploadingConsent(true);
    
    try {
      const fData = new FormData();
      fData.append("file", file);
      fData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "students_unsigned");
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dmeu6hdwg"}/image/upload`, { method: "POST", body: fData });
      const cloudData = await res.json();
      
      if (cloudData.secure_url) {
        // Save to backend
        const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${selectedStudent.rollNumber}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ...selectedStudent,
            parentStatus: "Approved", 
            parentConsentUrl: cloudData.secure_url 
          })
        });
        
        if (updateRes.ok) {
          const updatedStudent = await updateRes.json();
          setSelectedStudent(updatedStudent);
          fetchStudents();
          showSaveSuccess("Consent paper saved! 📄");
        }
      }
    } catch (err) {
      console.error(err);
    }
    setIsUploadingConsent(false);
    if (consentFileInputRef.current) consentFileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8 relative">

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Student Profiles</h1>
          <p className="text-slate-500 mt-0.5 text-sm md:text-base">Manage and track your students' wellness.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={() => setIsCsvModalOpen(true)} className="flex items-center px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors flex-1 sm:flex-none justify-center">
            <Upload className="w-4 h-4 mr-1.5" /> CSV
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm shadow-md shadow-purple-600/20 hover:bg-purple-700 transition-colors flex-1 sm:flex-none justify-center">
            <UserPlus className="w-4 h-4 mr-1.5" /> Add Student
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3">
        {[
          { label: "All", value: students.length, Icon: Users, color: "bg-blue-50 text-blue-600", tab: "all" as const },
          { label: "Active", value: activeStudents.length, Icon: UserCheck, color: "bg-green-50 text-green-600", tab: "active" as const },
          { label: "Inactive", value: inactiveStudents.length, Icon: UserX, color: "bg-red-50 text-red-600", tab: "inactive" as const },
          { label: "Present", value: todayRecords.length, Icon: CheckCircle2, color: "bg-purple-50 text-purple-600", tab: "today" as const },
          { label: "Calendar", value: attendanceDates.length + "d", Icon: Calendar, color: "bg-amber-50 text-amber-600", tab: "calendar" as const },
        ].map(s => (
          <motion.button key={s.tab} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(s.tab)}
            className={cn("rounded-xl md:rounded-2xl p-2.5 md:p-4 text-center transition-all border-2", activeTab === s.tab ? "border-purple-400 shadow-lg shadow-purple-100 bg-white" : "border-transparent " + s.color.split(" ")[0])}
          >
            <s.Icon className={cn("w-4 h-4 mx-auto mb-0.5", s.color.split(" ")[1])} />
            <div className={cn("text-lg md:text-xl font-black", s.color.split(" ")[1])}>{s.value}</div>
            <div className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase leading-tight">{s.label}</div>
          </motion.button>
        ))}
      </div>

      {/* Search Bar — shown for list tabs */}
      {(activeTab === "all" || activeTab === "active" || activeTab === "inactive") && (
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Search students by name or roll..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-purple-400 transition-all shadow-sm"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      )}


      {/* Main Layout: List + Profile View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Student List / Today / Calendar */}
        <div className={cn("lg:col-span-2 space-y-4 max-h-[700px] overflow-y-auto pr-2 pb-10", selectedStudent ? "hidden lg:block" : "block")}>

          {/* ── Today Tab ── */}
          {activeTab === "today" && (
            <div className="space-y-3">
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 mb-2">
                <h3 className="font-black text-purple-700 text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Today's Present Students ({todayRecords.length})</h3>
              </div>
              {todayRecords.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-slate-400 font-bold">No attendance recorded yet today.</div>
              ) : todayRecords.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm group relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center font-black text-green-700">{r.name?.charAt(0)}</div>
                      <div>
                        <div className="font-bold text-slate-800">{r.name}</div>
                        <div className="text-xs text-slate-400">Roll: {r.roll_number}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={cn("px-3 py-1 rounded-full text-xs font-bold cursor-default",
                          r.score >= 8 ? "bg-green-100 text-green-700" : r.score >= 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                        )}>
                          {r.score}/10
                        </div>
                        {/* Hover tooltip for risk */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                          <div className={cn("px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap shadow-xl",
                            r.risk === "Emotional Drop" ? "bg-red-500 text-white" : r.risk === "Needs Attention" ? "bg-orange-500 text-white" : "bg-green-500 text-white"
                          )}>
                            {r.risk === "Emotional Drop" && <ShieldAlert className="w-3 h-3 inline mr-1" />}
                            {r.risk === "Needs Attention" && <HeartPulse className="w-3 h-3 inline mr-1" />}
                            {r.risk === "Stable" && <ShieldCheck className="w-3 h-3 inline mr-1" />}
                            {r.risk}
                          </div>
                          <div className="w-2 h-2 rotate-45 bg-slate-800 mx-auto -mt-1" />
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{r.timestamp?.split(" ")[1]?.slice(0, 5)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── Calendar Tab ── */}
          {activeTab === "calendar" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronLeft className="w-4 h-4" /></button>
                  <h3 className="font-black text-slate-700">{new Date(calYear, calMonth).toLocaleString("en", { month: "long", year: "numeric" })}</h3>
                  <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {(() => { const first = new Date(calYear, calMonth, 1).getDay(); const days = new Date(calYear, calMonth + 1, 0).getDate(); const cells = [];
                    for (let i = 0; i < first; i++) cells.push(<div key={`e${i}`} />);
                    for (let d = 1; d <= days; d++) {
                      const ds = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                      const entry = attendanceDates.find(a => a.date === ds);
                      cells.push(
                        <button key={d} onClick={() => entry && fetchDateRecords(ds)}
                          className={cn("h-9 rounded-xl text-xs font-bold transition-all",
                            selectedDate === ds ? "bg-purple-600 text-white shadow-lg" :
                            entry ? "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer" : "text-slate-400 hover:bg-slate-50"
                          )}>
                          {d}
                          {entry && <div className="w-1 h-1 rounded-full bg-current mx-auto mt-0.5" />}
                        </button>
                      );
                    } return cells;
                  })()}
                </div>
              </div>
              {selectedDate && (
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100">
                    <h4 className="font-black text-blue-700 text-sm"><Calendar className="w-4 h-4 inline mr-1" />{selectedDate} — {dateRecords.length} Present</h4>
                  </div>
                  {dateRecords.map((r, i) => (
                    <div key={i} className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center font-black text-purple-700 text-sm">{r.name?.charAt(0)}</div>
                        <div><span className="font-bold text-slate-700 text-sm">{r.name}</span><span className="text-xs text-slate-400 ml-2">Roll: {r.roll_number}</span></div>
                      </div>
                      <div className={cn("px-2 py-1 rounded-lg text-xs font-bold", r.score >= 8 ? "bg-green-100 text-green-700" : r.score >= 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>{r.score}/10</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── List Tabs (All / Active / Inactive) ── */}
          {(activeTab === "all" || activeTab === "active" || activeTab === "inactive") && (<>
            {filteredStudents.length === 0 ? (
              <div className="glass-card p-10 text-center text-slate-500">
                {activeTab === "inactive" ? "No inactive students." : "No students found."}
              </div>
            ) : paginatedStudents.map((student) => (
              <motion.div key={student.id || student.rollNumber} whileHover={{ scale: 1.01 }} onClick={() => setSelectedStudent(student)}
                className={cn("glass-card p-3 md:p-4 border-none cursor-pointer transition-all duration-300",
                  student.status === "inactive" && "opacity-60",
                  selectedStudent?.rollNumber === student.rollNumber ? "ring-2 ring-purple-500 bg-white/90 shadow-lg" : "bg-white/60 hover:bg-white/80"
                )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {student.profilePhoto ? (
                      <img src={student.profilePhoto} alt={student.firstName} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-inner flex-shrink-0" />
                    ) : (
                      <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-base md:text-lg shadow-inner flex-shrink-0",
                        student.status === "inactive" ? "bg-slate-200 text-slate-500" : "bg-gradient-to-tr from-purple-200 to-pink-200 text-purple-700"
                      )}>{student.firstName[0]}</div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm md:text-base truncate">{student.firstName} {student.lastInitial}
                        {student.status === "inactive" && <span className="ml-1 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-black">OFF</span>}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">Roll: {student.rollNumber} • {student.class_name || student.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="text-right hidden sm:block mr-2">
                      <div className="text-sm font-bold text-slate-700">{student.attendance}%</div>
                      <div className="text-xs text-slate-400">Att.</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleStatus(student.rollNumber); }}
                      className={cn("p-1.5 rounded-lg transition-colors", student.status === "inactive" ? "hover:bg-green-100" : "hover:bg-orange-100")}>
                      {student.status === "inactive" ? <UserCheck className="w-4 h-4 text-green-600" /> : <UserX className="w-4 h-4 text-orange-500" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setStudentToEdit(student); setIsEditModalOpen(true); }}
                      className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-slate-400 hover:text-purple-600" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.rollNumber); }}
                      className="p-1.5 hover:bg-red-100 rounded-lg transition-colors">
                      <X className="w-4 h-4 text-slate-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {/* Pagination Controls */}
            {filteredStudents.length > itemsPerPage && (
              <div className="flex justify-center items-center space-x-2 pt-6">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 disabled:opacity-50 hover:bg-slate-50 shadow-sm transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold text-slate-600 px-3 bg-white py-1.5 rounded-lg shadow-sm border border-slate-100">Page {currentPage} of {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 disabled:opacity-50 hover:bg-slate-50 shadow-sm transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>)}
        </div>


        {/* Selected Student Profile Sidebar */}
        <div className={cn("lg:col-span-1", !selectedStudent ? "hidden lg:block" : "block")}>
          <AnimatePresence mode="wait">
            {selectedStudent ? (
              <motion.div
                key={selectedStudent.rollNumber}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card bg-white/80 border-none sticky top-8"
              >
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="lg:hidden w-full mb-4 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" /> Back to Students
                </button>
                <div className="text-center mb-6">
                  {selectedStudent.profilePhoto ? (
                    <img src={selectedStudent.profilePhoto} alt={selectedStudent.firstName} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-xl mb-4" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-200 to-pink-200 mx-auto flex items-center justify-center font-bold text-purple-700 text-4xl shadow-inner mb-4">
                      {selectedStudent.firstName[0]}
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-slate-800">{selectedStudent.firstName} {selectedStudent.lastInitial}</h2>
                  <p className="text-slate-500 font-medium">Roll: {selectedStudent.rollNumber} | {selectedStudent.class_name || selectedStudent.class}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-sm">
                  <div><span className="text-slate-400 font-bold block text-xs">BLOOD GROUP</span><span className="font-medium text-slate-700">{selectedStudent.bloodGroup || "-"}</span></div>
                  <div><span className="text-slate-400 font-bold block text-xs">SECTION</span><span className="font-medium text-slate-700">{selectedStudent.section || "A"}</span></div>
                  <div className="col-span-2"><span className="text-slate-400 font-bold block text-xs">PARENTS NAME</span><span className="font-medium text-slate-700">{selectedStudent.parentsName || "-"}</span></div>
                  <div className="col-span-2"><span className="text-slate-400 font-bold block text-xs">PARENTS PHONE</span><span className="font-medium text-slate-700">{selectedStudent.parentsPhone || "-"}</span></div>
                </div>

                <div className="space-y-6">
                  {/* Status Boxes */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-2xl p-4 text-center">
                      <div className="text-2xl font-black text-purple-600">{selectedStudent.attendance}%</div>
                      <div className="text-xs font-bold text-purple-400 uppercase mt-1">Attendance</div>
                    </div>
                    <div className={cn(
                      "rounded-2xl p-4 text-center flex flex-col items-center justify-center relative group",
                      selectedStudent.parentStatus === "Approved" ? "bg-green-50" : "bg-orange-50"
                    )}>
                      <div className={cn("text-sm font-bold", selectedStudent.parentStatus === "Approved" ? "text-green-600" : "text-orange-600")}>
                        {selectedStudent.parentStatus}
                      </div>
                      <div className={cn("text-xs font-bold uppercase mt-1 mb-2", selectedStudent.parentStatus === "Approved" ? "text-green-400" : "text-orange-400")}>Parent Consent</div>
                      
                      <input 
                        type="file" 
                        ref={consentFileInputRef} 
                        onChange={handleConsentUpload} 
                        accept="image/*,.pdf" 
                        className="hidden" 
                      />
                      
                      {selectedStudent.parentStatus === "Approved" && selectedStudent.parentConsentUrl ? (
                        <div className="flex items-center gap-2 mt-1">
                          <a href={selectedStudent.parentConsentUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black bg-green-200 text-green-800 px-3 py-1.5 rounded-full hover:bg-green-300 transition-colors flex items-center">
                            <Eye className="w-3 h-3 mr-1" /> View
                          </a>
                          <button 
                            onClick={() => consentFileInputRef.current?.click()}
                            disabled={isUploadingConsent}
                            className="text-[10px] font-black bg-white text-green-700 px-3 py-1.5 rounded-full border border-green-200 hover:bg-green-50 transition-colors"
                          >
                            {isUploadingConsent ? "..." : "Change"}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => consentFileInputRef.current?.click()}
                          disabled={isUploadingConsent}
                          className="mt-1 flex items-center justify-center text-[11px] font-black bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-500/20"
                        >
                          {isUploadingConsent ? "Uploading..." : <><Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Form</>}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Emotional Timeline */}
                  <div>
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                      <HeartPulse className="w-4 h-4 mr-2 text-pink-500" />
                      Weekly Emotional Timeline
                    </h3>
                    <div className="space-y-3">
                      {(selectedStudent.timeline && selectedStudent.timeline.length > 0) ? selectedStudent.timeline.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/60">
                          <div className="font-bold text-slate-600 w-12">{entry.day}</div>
                          <div className="text-2xl">{entry.emoji}</div>
                          <div className="flex items-center space-x-2">
                            <span className={cn(
                              "font-bold text-sm",
                              entry.score >= 8 ? "text-green-500" : entry.score >= 5 ? "text-orange-500" : "text-red-500"
                            )}>{entry.score}/10</span>
                            {entry.alert && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold">ALERT</span>}
                          </div>
                        </div>
                      )) : (
                        <div className="text-sm text-slate-400 text-center py-4">No data this week yet.</div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold shadow-md hover:bg-slate-700 transition-colors"
                  >
                    View Full Report
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4 sticky top-8"
              >
                {/* Animated Prompt Card */}
                <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-pink-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-purple-200">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.15),transparent)]" />
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4"
                    >
                      <MousePointerClick className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className="font-black text-xl mb-1">Pick a Student!</h3>
                    <p className="text-purple-100 text-sm font-medium leading-relaxed">
                      Click any student from the list to instantly view their full wellness profile, emotional history, and parent details.
                    </p>
                  </div>
                </div>

                {/* Class Summary Stats */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-700 text-sm mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    Class Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Total Students", value: students.length, Icon: Users, iconColor: "text-blue-600", color: "bg-blue-50" },
                      { label: "Stable", value: students.filter(s => s.risk === "Stable").length, Icon: ShieldCheck, iconColor: "text-green-600", color: "bg-green-50" },
                      { label: "Need Attention", value: students.filter(s => s.risk !== "Stable").length, Icon: AlertTriangle, iconColor: "text-orange-500", color: "bg-orange-50" },
                      { label: "Avg Attendance", value: students.length > 0 ? Math.round(students.reduce((a, s) => a + s.attendance, 0) / students.length) + "%" : "—", Icon: BarChart2, iconColor: "text-purple-600", color: "bg-purple-50" },
                    ].map(stat => (
                      <div key={stat.label} className={`${stat.color} rounded-2xl p-3 text-center`}>
                        <div className="flex justify-center mb-1.5">
                          <stat.Icon className={`w-5 h-5 ${stat.iconColor}`} />
                        </div>
                        <div className={`font-black text-lg ${stat.iconColor}`}>{stat.value}</div>
                        <div className="text-xs font-bold text-slate-500 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Tip Cards */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-700 text-sm mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Teacher Tips
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { tip: "Click a student name to view their wellness timeline and emotional history.", Icon: ClipboardList, color: "text-blue-500 bg-blue-50" },
                      { tip: "Use the ⋮ button to edit a student's profile and parent details.", Icon: Pencil, color: "text-purple-500 bg-purple-50" },
                      { tip: "Students with 'Emotional Drop' need your attention today!", Icon: HeartPulse, color: "text-red-500 bg-red-50" },
                    ].map((t, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${t.color}`}>
                          <t.Icon className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed">{t.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Alert */}
                {students.some(s => s.risk !== "Stable") && (
                  <div className="bg-red-50 border border-red-100 rounded-3xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertOctagon className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-red-700">Wellness Alert</p>
                      <p className="text-xs text-red-600 font-medium mt-0.5">
                        {students.filter(s => s.risk !== "Stable").map(s => s.firstName).join(", ")} need{students.filter(s => s.risk !== "Stable").length === 1 ? "s" : ""} emotional support today.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <Modal onClose={() => setIsAddModalOpen(false)} title="Add New Student">
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">First Name</label>
                  <input required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Last Name / Initial</label>
                  <input required value={formData.lastInitial} onChange={(e) => setFormData({...formData, lastInitial: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Roll Number</label>
                  <input required value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Blood Group</label>
                  <input value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} placeholder="e.g. O+" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Class</label>
                  <input required value={formData.class_name} onChange={(e) => setFormData({...formData, class_name: e.target.value})} placeholder="e.g. Nursery" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Section</label>
                  <input required value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} placeholder="e.g. A" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Parents Name</label>
                <input value={formData.parentsName} onChange={(e) => setFormData({...formData, parentsName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Parents Phone</label>
                <input value={formData.parentsPhone} onChange={(e) => setFormData({...formData, parentsPhone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Profile Photo</label>
                <div className="flex items-center space-x-3">
                  {formData.profilePhoto && <img src={formData.profilePhoto} className="w-12 h-12 rounded-full object-cover shadow border-2 border-purple-100" alt="Preview" />}
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    showSaveSuccess("⏳ Uploading photo...");
                    const fData = new FormData();
                    fData.append("file", file);
                    fData.append("upload_preset", "students_unsigned");
                    try {
                      const res = await fetch(`https://api.cloudinary.com/v1_1/dmeu6hdwg/image/upload`, { method: "POST", body: fData });
                      if (res.ok) {
                        const data = await res.json();
                        setFormData(prev => ({...prev, profilePhoto: data.secure_url}));
                        showSaveSuccess("✅ Photo uploaded!");
                      } else {
                        const err = await res.json();
                        showSaveSuccess("❌ Upload failed!");
                      }
                    } catch (err) { showSaveSuccess("❌ Upload error."); }
                  }} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer w-full" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold">Save Student</button>
            </form>
          </Modal>
        )}

        {isEditModalOpen && studentToEdit && (
          <Modal onClose={() => setIsEditModalOpen(false)} title="Edit Student Profile">
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">First Name</label>
                  <input required value={studentToEdit.firstName} onChange={(e) => setStudentToEdit({...studentToEdit, firstName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Last Name / Initial</label>
                  <input required value={studentToEdit.lastInitial} onChange={(e) => setStudentToEdit({...studentToEdit, lastInitial: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Class</label>
                  <input required value={studentToEdit.class_name || studentToEdit.class || ""} onChange={(e) => setStudentToEdit({...studentToEdit, class_name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Section</label>
                  <input value={studentToEdit.section || ""} onChange={(e) => setStudentToEdit({...studentToEdit, section: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Blood Group</label>
                  <input value={studentToEdit.bloodGroup || ""} onChange={(e) => setStudentToEdit({...studentToEdit, bloodGroup: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Parents Phone</label>
                  <input value={studentToEdit.parentsPhone || ""} onChange={(e) => setStudentToEdit({...studentToEdit, parentsPhone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Parents Name</label>
                <input value={studentToEdit.parentsName || ""} onChange={(e) => setStudentToEdit({...studentToEdit, parentsName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Profile Photo</label>
                <div className="flex items-center space-x-3">
                  {studentToEdit.profilePhoto && <img src={studentToEdit.profilePhoto} className="w-12 h-12 rounded-full object-cover shadow border-2 border-purple-100" alt="Preview" />}
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    showSaveSuccess("⏳ Uploading photo...");
                    const fData = new FormData();
                    fData.append("file", file);
                    fData.append("upload_preset", "students_unsigned");
                    try {
                      const res = await fetch(`https://api.cloudinary.com/v1_1/dmeu6hdwg/image/upload`, { method: "POST", body: fData });
                      if (res.ok) {
                        const data = await res.json();
                        setStudentToEdit(prev => prev ? {...prev, profilePhoto: data.secure_url} : null);
                        showSaveSuccess("✅ Photo uploaded!");
                      } else {
                        showSaveSuccess("❌ Upload failed!");
                      }
                    } catch (err) { showSaveSuccess("❌ Upload error."); }
                  }} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer w-full" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex justify-center items-center">
                <Save className="w-4 h-4 mr-2"/> Update Profile
              </button>
            </form>
          </Modal>
        )}

        {isCsvModalOpen && (
          <Modal onClose={() => setIsCsvModalOpen(false)} title="Import via CSV">
            <div className="space-y-6">
              <p className="text-sm text-slate-500">Upload a CSV file with columns: <b>firstName, lastInitial, rollNumber, class_name</b></p>
              <div 
                className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <div className="font-bold text-slate-700">Click to select CSV</div>
              </div>
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleCsvUpload} />
            </div>
          </Modal>
        )}

        {isReportModalOpen && selectedStudent && (
          <Modal onClose={() => setIsReportModalOpen(false)} title={`${selectedStudent.firstName}'s Full Report`} large>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl text-center"><div className="text-2xl font-black text-slate-800">{selectedStudent.attendance}%</div><div className="text-xs text-slate-500 uppercase font-bold">Yearly Attendance</div></div>
                <div className="bg-slate-50 p-4 rounded-xl text-center"><div className="text-2xl font-black text-slate-800">8.5</div><div className="text-xs text-slate-500 uppercase font-bold">Avg Mood Score</div></div>
                <div className="bg-slate-50 p-4 rounded-xl text-center"><div className="text-2xl font-black text-slate-800">2</div><div className="text-xs text-slate-500 uppercase font-bold">Alerts Triggered</div></div>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">AI Wellness Insight</h3>
                <p className="text-sm text-blue-800 font-medium">"{selectedStudent.firstName} has shown positive emotional improvement this week. Participation in morning check-ins has been highly consistent."</p>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable Modal Component
function Modal({ children, onClose, title, large = false }: { children: React.ReactNode, onClose: () => void, title: string, large?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn("bg-white rounded-3xl shadow-2xl overflow-hidden w-full", large ? "max-w-2xl" : "max-w-md")}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500"/></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
