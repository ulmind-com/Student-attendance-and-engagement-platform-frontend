"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader, SettingsCard, SaveButton } from "./shared";
import { Plus, Trash2, GripVertical, CheckCircle2, History, ListChecks, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Question = { id: string; text: string; targetType: string; targetValue?: string; enabled: boolean };

export default function EmotionalQuestionsPanel() {
  const [activeTab, setActiveTab] = useState<"manage" | "history">("manage");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [toast, setToast] = useState<{show: boolean; msg: string}>({show: false, msg: ""});
  
  const [newQText, setNewQText] = useState("");
  const [newTargetType, setNewTargetType] = useState("global");
  const [newTargetValue, setNewTargetValue] = useState("");
  
  const [newTargetSearchTerm, setNewTargetSearchTerm] = useState("");
  const [selectedTargetStudent, setSelectedTargetStudent] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [students, setStudents] = useState<any[]>([]);
  const classes = ["All", ...Array.from(new Set(students.map(s => s.className)))];

  const fetchData = async () => {
    try {
      const timestamp = Date.now();
      const [qs, hs, sts] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/list?t=${timestamp}`, { cache: "no-store" }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/history?t=${timestamp}`, { cache: "no-store" }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/otps/list?t=${timestamp}`, { cache: "no-store" })
      ]);
      if (qs.ok) setQuestions(await qs.json());
      if (hs.ok) setHistory(await hs.json());
      if (sts.ok) setStudents(await sts.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const saveToBackend = async (newQs: Question[], suppressToast = false) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQs)
      });
      if (!suppressToast) showToast("Questions successfully saved!");
    } catch (e) {}
  };

  const addQuestion = () => {
    if (!newQText.trim()) return;
    if (newTargetType !== "global" && !newTargetValue) return;

    const newQ = { 
      id: `q_${Date.now()}`, 
      text: newQText, 
      targetType: newTargetType,
      targetValue: newTargetValue || undefined,
      enabled: true 
    };

    const newQuestions = [...questions, newQ];
    setQuestions(newQuestions);
    saveToBackend(newQuestions);

    setNewQText("");
    setNewTargetValue("");
    setNewTargetSearchTerm("");
    setSelectedTargetStudent(null);
  };

  const deleteQ = (id: string) => {
    const newQuestions = questions.filter(x => x.id !== id);
    setQuestions(newQuestions);
    saveToBackend(newQuestions);
  };

  const toggleQ = (id: string) => {
    const newQuestions = questions.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x);
    setQuestions(newQuestions);
    saveToBackend(newQuestions);
  };

  const saveAll = async () => {
    await saveToBackend(questions, true);
  };

  return (
    <div className="space-y-6 max-w-4xl relative">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-emerald-500/20 font-black text-sm flex items-center gap-3 border border-emerald-400/30"
          >
            <Sparkles className="w-5 h-5 text-emerald-100" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader title="Dynamic Emotional Questions" description="Manage targeted daily check-in questions and view student responses." />

      <div className="flex bg-slate-100 p-1 rounded-2xl w-max shadow-inner">
        <button onClick={() => setActiveTab("manage")} className={cn("px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2", activeTab === "manage" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700")} >
          <ListChecks className="w-4 h-4" /> Question Bank
        </button>
        <button onClick={() => setActiveTab("history")} className={cn("px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2", activeTab === "history" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700")} >
          <History className="w-4 h-4" /> Daily Response History
        </button>
      </div>

      {activeTab === "manage" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
          <SettingsCard>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-slate-800 flex items-center gap-2"><span className="text-lg">❓</span> Active Questions ({questions.filter(q => q.enabled).length})</h3>
            </div>
            
            <div className="space-y-3 mb-8">
              {questions.map((q, i) => (
                <div key={q.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${q.enabled ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50 border-slate-100 opacity-60"}`}>
                  <GripVertical className="w-5 h-5 text-slate-300 cursor-grab flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-slate-800 truncate">{q.text}</div>
                    <div className="flex gap-2 mt-1.5">
                      <span className={cn("text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-md", 
                        q.targetType === "global" ? "bg-blue-50 text-blue-600" : 
                        q.targetType === "class" ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {q.targetType}
                      </span>
                      {q.targetValue && (
                        <span className="text-xs font-bold text-slate-500">
                          {q.targetType === "student" ? (
                            (() => {
                              const s = students.find(x => x.rollNumber === q.targetValue);
                              if (s) return `${s.name} (${s.className} - ${s.section}) • Roll: ${s.rollNumber}`;
                              return `Roll: ${q.targetValue}`;
                            })()
                          ) : (
                            q.targetValue
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleQ(q.id)} className={`w-11 h-6 rounded-full transition-all relative ${q.enabled ? "bg-rose-500" : "bg-slate-300"}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${q.enabled ? "right-1" : "left-1"}`} />
                    </button>
                    <button onClick={() => deleteQ(q.id)} className="p-2 hover:bg-red-50 rounded-xl ml-1 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
              {questions.length === 0 && <p className="text-slate-400 font-bold text-center py-6">No questions added yet.</p>}
            </div>

            <div className="bg-rose-50/50 rounded-3xl p-6 border border-rose-100">
              <h4 className="text-sm font-black text-rose-800 uppercase tracking-widest flex items-center gap-2 mb-4"><Plus className="w-4 h-4" /> Add New Target Question</h4>
              
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-rose-700/70 uppercase block mb-1.5">Question Text (Yes/No)</label>
                  <input type="text" value={newQText} onChange={e => setNewQText(e.target.value)} placeholder="e.g. Are you feeling better today?" className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl font-bold text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-xs font-bold text-rose-700/70 uppercase block mb-1.5">Target Audience</label>
                  <select value={newTargetType} onChange={e => setNewTargetType(e.target.value)} className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl font-bold text-slate-800 outline-none focus:border-rose-400">
                    <option value="global">Global (Everyone)</option>
                    <option value="class">Specific Class/Section</option>
                    <option value="student">Specific Student</option>
                  </select>
                </div>
                
                {newTargetType === "class" && (
                  <div className="flex-1">
                    <label className="text-xs font-bold text-rose-700/70 uppercase block mb-1.5">Select Class</label>
                    <input type="text" value={newTargetValue} onChange={e => setNewTargetValue(e.target.value)} placeholder="e.g. Nursery - A" className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl font-bold text-slate-800 outline-none focus:border-rose-400" />
                  </div>
                )}

                {newTargetType === "student" && (
                  <div className="flex-1 relative">
                    <label className="text-xs font-bold text-rose-700/70 uppercase block mb-1.5">Search Student</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={newTargetSearchTerm} 
                        onChange={e => {
                          setNewTargetSearchTerm(e.target.value);
                          setShowSuggestions(true);
                          setSelectedTargetStudent(null);
                          setNewTargetValue("");
                        }} 
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Type student name..." 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-rose-200 rounded-xl font-bold text-slate-800 outline-none focus:border-rose-400" 
                      />
                      <Search className="absolute left-3.5 bottom-3.5 w-4 h-4 text-slate-400" />
                      
                      {showSuggestions && newTargetSearchTerm && !selectedTargetStudent && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-[100] max-h-48 overflow-y-auto">
                          {students.filter(s => s.name.toLowerCase().includes(newTargetSearchTerm.toLowerCase())).slice(0, 5).map(s => (
                            <div 
                              key={s.rollNumber} 
                              onClick={() => {
                                setSelectedTargetStudent(s);
                                setNewTargetValue(s.rollNumber);
                                setNewTargetSearchTerm(s.name);
                                setShowSuggestions(false);
                              }}
                              className="px-4 py-3 hover:bg-rose-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                            >
                              <div className="font-bold text-slate-800">{s.name}</div>
                              <div className="text-xs text-slate-500 font-medium">{s.className} - {s.section} &bull; Roll: {s.rollNumber}</div>
                            </div>
                          ))}
                          {students.filter(s => s.name.toLowerCase().includes(newTargetSearchTerm.toLowerCase())).length === 0 && (
                            <div className="px-4 py-3 text-sm text-slate-500 font-bold">No students found.</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {selectedTargetStudent && (
                      <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl animate-in fade-in zoom-in-95">
                        <div className="text-[10px] text-rose-600 font-black uppercase tracking-wider mb-1">Selected Student</div>
                        <div className="font-black text-rose-900">{selectedTargetStudent.name}</div>
                        <div className="text-sm text-rose-800 mt-1 flex gap-4">
                          <span><span className="font-medium opacity-70">Class:</span> {selectedTargetStudent.className}</span>
                          <span><span className="font-medium opacity-70">Sec:</span> {selectedTargetStudent.section}</span>
                          <span><span className="font-medium opacity-70">Roll:</span> {selectedTargetStudent.rollNumber}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <button onClick={addQuestion} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-black hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-200">
                  Add to Bank
                </button>
              </div>
            </div>
            
            <div className="flex justify-end pt-6 border-t mt-6 border-slate-100">
              <SaveButton onSave={saveAll} />
            </div>
          </SettingsCard>
        </div>
      )}

      {activeTab === "history" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
          <SettingsCard>
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><History className="w-5 h-5 text-rose-500" /> Student Responses Log</h3>
            
            <div className="space-y-6">
              {history.map((log, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="font-black text-lg text-slate-800">{log.studentName}</h4>
                      <p className="font-mono text-sm text-slate-500">Roll: {log.rollNumber}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-800">{log.date}</div>
                      <div className="text-xs font-bold text-slate-400 flex items-center justify-end gap-2 mt-1">
                        Mood: <span className="text-base">{log.emoji}</span> ({log.score}/10)
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(log.questions || {}).map(([q, ans]: any, j) => (
                      <div key={j} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                        <span className="font-bold text-slate-700 text-sm">{q}</span>
                        {ans ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Yes</span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">No</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-slate-400 font-bold text-center py-10">No response history found.</p>}
            </div>
          </SettingsCard>
        </div>
      )}
    </div>
  );
}
