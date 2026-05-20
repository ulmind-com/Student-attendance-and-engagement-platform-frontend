"use client";
import { useState, useEffect, useRef } from "react";
import { SectionHeader, SettingsCard, Label, Input, SaveButton } from "./shared";
import { Plus, Trash2, Edit3, Users, GraduationCap, BookOpen, Loader2, Check, X, ChevronDown, Search } from "lucide-react";

type ClassItem = { id: number; name: string; section: string; teacher: string; students: number; limit: number };
type TeacherItem = { id: number; name: string; subject: string; classes: string[] };

const ROLES = ["Super Admin", "Teacher", "Parent Viewer"] as const;
const PERMISSIONS: Record<string, { label: string; allowed: string[] }> = {
  "Super Admin": { label: "Full Access", allowed: ["View reports", "Manage attendance", "Delete students", "Configure settings", "Manage teachers"] },
  "Teacher": { label: "Standard Access", allowed: ["View reports", "Manage attendance", "Add wellness notes"] },
  "Parent Viewer": { label: "Read Only", allowed: ["View own child report"] },
};

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Teacher Autocomplete Component ──
function TeacherAutocomplete({ value, onChange, teachers, placeholder = "Select teacher" }: { value: string; onChange: (v: string) => void; teachers: TeacherItem[]; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pr-8"
        />
        <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 max-h-40 overflow-y-auto">
          {filtered.map(t => (
            <button key={t.id} type="button"
              onClick={() => { onChange(t.name); setQuery(t.name); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-blue-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {t.name[0]}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{t.name}</div>
                <div className="text-[10px] text-slate-400">{t.subject}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClassesUsersPanel() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [realStudentCount, setRealStudentCount] = useState(0);

  const classesRef = useRef(classes);
  const teachersRef = useRef(teachers);
  classesRef.current = classes;
  teachersRef.current = teachers;

  useEffect(() => {
    fetchData();
    // Fetch real student count
    fetch(`${API}/students`).then(r => r.json()).then(d => { if (Array.isArray(d)) setRealStudentCount(d.length); }).catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/settings/classes`);
      const data = await res.json();
      if (data && Array.isArray(data.classes)) {
        // Migrate old format: if class has no section, split from name
        const migrated = data.classes.map((c: any) => {
          if (!c.section && c.name && c.name.includes("-")) {
            const parts = c.name.split("-");
            return { ...c, name: parts[0].trim(), section: parts.slice(1).join("-").trim() };
          }
          return { ...c, section: c.section || "" };
        });
        setClasses(migrated);
        setTeachers(data.teachers || []);
      } else {
        setClasses([
          { id: 1, name: "Nursery", section: "A", teacher: "Emma Watson", students: 18, limit: 30 },
          { id: 2, name: "Nursery", section: "B", teacher: "Priya Sharma", students: 22, limit: 30 },
          { id: 3, name: "KG", section: "A", teacher: "Anita Roy", students: 15, limit: 25 },
        ]);
        setTeachers([
          { id: 1, name: "Emma Watson", subject: "Class Teacher", classes: ["Nursery-A"] },
          { id: 2, name: "Priya Sharma", subject: "Class Teacher", classes: ["Nursery-B"] },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToServer = async (newClasses: ClassItem[], newTeachers: TeacherItem[]) => {
    setIsSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`${API}/settings/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classes: newClasses, teachers: newTeachers }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveMsg("✓ Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch (e) {
      console.error(e);
      setSaveMsg("⚠ Save failed");
      setTimeout(() => setSaveMsg(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Class actions ──
  const [newClass, setNewClass] = useState({ name: "", section: "", teacher: "", limit: "30" });
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [editClassData, setEditClassData] = useState({ name: "", section: "", teacher: "", limit: "30" });

  const addClass = async () => {
    if (!newClass.name || !newClass.section) return;
    const updated = [...classesRef.current, { id: Date.now(), name: newClass.name, section: newClass.section, teacher: newClass.teacher, students: 0, limit: Number(newClass.limit) }];
    setClasses(updated);
    setNewClass({ name: "", section: "", teacher: "", limit: "30" });
    await saveToServer(updated, teachersRef.current);
  };
  const deleteClass = async (id: number) => {
    const updated = classesRef.current.filter(x => x.id !== id);
    setClasses(updated);
    await saveToServer(updated, teachersRef.current);
  };
  const startEditClass = (cls: ClassItem) => {
    setEditingClassId(cls.id);
    setEditClassData({ name: cls.name, section: cls.section, teacher: cls.teacher, limit: String(cls.limit) });
  };
  const saveEditClass = async () => {
    if (!editingClassId) return;
    const updated = classesRef.current.map(c => c.id === editingClassId ? { ...c, name: editClassData.name, section: editClassData.section, teacher: editClassData.teacher, limit: Number(editClassData.limit) } : c);
    setClasses(updated);
    setEditingClassId(null);
    await saveToServer(updated, teachersRef.current);
  };

  // ── Teacher actions ──
  const [newTeacher, setNewTeacher] = useState({ name: "", subject: "" });
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
  const [editTeacherData, setEditTeacherData] = useState({ name: "", subject: "" });

  const addTeacher = async () => {
    if (!newTeacher.name) return;
    const updated = [...teachersRef.current, { id: Date.now(), name: newTeacher.name, subject: newTeacher.subject, classes: [] }];
    setTeachers(updated);
    setNewTeacher({ name: "", subject: "" });
    await saveToServer(classesRef.current, updated);
  };
  const deleteTeacher = async (id: number) => {
    const updated = teachersRef.current.filter(i => i.id !== id);
    setTeachers(updated);
    await saveToServer(classesRef.current, updated);
  };
  const startEditTeacher = (t: TeacherItem) => {
    setEditingTeacherId(t.id);
    setEditTeacherData({ name: t.name, subject: t.subject });
  };
  const saveEditTeacher = async () => {
    if (!editingTeacherId) return;
    const updated = teachersRef.current.map(t => t.id === editingTeacherId ? { ...t, name: editTeacherData.name, subject: editTeacherData.subject } : t);
    setTeachers(updated);
    setEditingTeacherId(null);
    await saveToServer(classesRef.current, updated);
  };

  const [activeRole, setActiveRole] = useState<string>("Teacher");

  // Stats
  const uniqueClassNames = Array.from(new Set(classes.map(c => c.name)));
  const uniqueSections = Array.from(new Set(classes.map(c => c.section).filter(Boolean)));

  return (
    <div className="space-y-8 max-w-2xl">
      <SectionHeader title="Classes & Users" description="Manage class rooms, teachers, and user permissions." />

      {/* Status bar */}
      {(isSaving || saveMsg) && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isSaving ? "bg-blue-50 text-blue-600 border border-blue-100" : saveMsg.startsWith("✓") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSaving ? "Saving to database..." : saveMsg}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-emerald-600">{classes.length}</div>
          <div className="text-[11px] font-bold text-emerald-500/70 uppercase tracking-wider mt-0.5">Total Classes</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-blue-600">{teachers.length}</div>
          <div className="text-[11px] font-bold text-blue-500/70 uppercase tracking-wider mt-0.5">Teachers</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-purple-600">{realStudentCount}</div>
          <div className="text-[11px] font-bold text-purple-500/70 uppercase tracking-wider mt-0.5">Total Students</div>
        </div>
      </div>

      {/* Class Management */}
      <SettingsCard>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-slate-800 flex items-center gap-2"><BookOpen className="w-4 h-4 text-green-500" /> Class Management</h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">{classes.length} classes</span>
        </div>

        {/* Class list */}
        <div className="space-y-2 mb-5">
          {classes.map(cls => (
            <div key={cls.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-green-200 hover:bg-green-50/30 transition-all">
              {editingClassId === cls.id ? (
                <div className="flex-1 grid grid-cols-5 gap-2 items-center">
                  <input value={editClassData.name} onChange={e => setEditClassData(d => ({...d, name: e.target.value}))} className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-green-500" placeholder="Class" />
                  <input value={editClassData.section} onChange={e => setEditClassData(d => ({...d, section: e.target.value}))} className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-green-500" placeholder="Section" />
                  <input value={editClassData.teacher} onChange={e => setEditClassData(d => ({...d, teacher: e.target.value}))} className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-green-500" placeholder="Teacher" />
                  <input value={editClassData.limit} onChange={e => setEditClassData(d => ({...d, limit: e.target.value}))} type="number" className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-green-500" placeholder="Limit" />
                  <div className="flex gap-1 justify-end">
                    <button onClick={saveEditClass} className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"><Check className="w-3.5 h-3.5 text-green-600" /></button>
                    <button onClick={() => setEditingClassId(null)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><X className="w-3.5 h-3.5 text-slate-500" /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center shadow-sm">
                      <GraduationCap className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        {cls.name}
                        {cls.section && <span className="text-[10px] font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md">{cls.section}</span>}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>👩‍🏫 {cls.teacher || "Unassigned"}</span>
                        <span className="text-slate-300">•</span>
                        <span>👨‍🎓 {cls.students}/{cls.limit}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => startEditClass(cls)}>
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" onClick={() => deleteClass(cls.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add Class Form */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 space-y-3">
          <div className="text-xs font-bold text-green-700 uppercase tracking-wider flex items-center gap-1"><Plus className="w-3 h-3" /> Add New Class</div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={newClass.name} onChange={v => setNewClass(s => ({ ...s, name: v }))} placeholder="Class name (e.g. Nursery)" />
            <Input value={newClass.section} onChange={v => setNewClass(s => ({ ...s, section: v }))} placeholder="Section (e.g. A)" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TeacherAutocomplete value={newClass.teacher} onChange={v => setNewClass(s => ({ ...s, teacher: v }))} teachers={teachers} placeholder="Assign teacher" />
            <Input value={newClass.limit} onChange={v => setNewClass(s => ({ ...s, limit: v }))} placeholder="Student limit" type="number" />
          </div>
          <button onClick={addClass} disabled={isSaving || !newClass.name || !newClass.section} className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-bold hover:from-green-700 hover:to-emerald-700 active:scale-[0.98] transition-all disabled:opacity-40 shadow-sm shadow-green-200">
            {isSaving ? "Saving..." : "Add Class"}
          </button>
        </div>
      </SettingsCard>

      {/* Teacher Management */}
      <SettingsCard>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-slate-800 flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> Teacher Management</h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">{teachers.length} teachers</span>
        </div>

        <div className="space-y-2 mb-5">
          {teachers.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 hover:bg-blue-50/30 transition-all">
              {editingTeacherId === t.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input value={editTeacherData.name} onChange={e => setEditTeacherData(d => ({...d, name: e.target.value}))} className="flex-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="Teacher name" />
                  <input value={editTeacherData.subject} onChange={e => setEditTeacherData(d => ({...d, subject: e.target.value}))} className="flex-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="Subject / Role" />
                  <button onClick={saveEditTeacher} className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"><Check className="w-3.5 h-3.5 text-green-600" /></button>
                  <button onClick={() => setEditingTeacherId(null)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><X className="w-3.5 h-3.5 text-slate-500" /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.subject} • {t.classes.join(", ") || "No class assigned"}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => startEditTeacher(t)}>
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" onClick={() => deleteTeacher(t.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 space-y-3">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1"><Plus className="w-3 h-3" /> Add Teacher</div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={newTeacher.name} onChange={v => setNewTeacher(s => ({ ...s, name: v }))} placeholder="Teacher name" />
            <Input value={newTeacher.subject} onChange={v => setNewTeacher(s => ({ ...s, subject: v }))} placeholder="Subject / Role" />
          </div>
          <button onClick={addTeacher} disabled={isSaving || !newTeacher.name} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-40 shadow-sm shadow-blue-200">
            {isSaving ? "Saving..." : "Add Teacher"}
          </button>
        </div>
      </SettingsCard>

      {/* Role Permissions */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><span className="text-lg">🔐</span> Role Permissions</h3>
        <div className="flex gap-2 mb-5">
          {ROLES.map(r => (
            <button key={r} onClick={() => setActiveRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeRole === r ? "bg-purple-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {r}
            </button>
          ))}
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="text-xs font-bold text-slate-400 uppercase mb-3">{PERMISSIONS[activeRole].label}</div>
          <div className="space-y-2">
            {["View reports", "Manage attendance", "Delete students", "Configure settings", "Manage teachers", "Add wellness notes", "View own child report"].map(perm => {
              const allowed = PERMISSIONS[activeRole].allowed.includes(perm);
              return (
                <div key={perm} className="flex items-center gap-2 text-sm">
                  <span className={`w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full text-xs font-black ${allowed ? "bg-green-100 text-green-600" : "bg-red-50 text-red-400"}`}>
                    {allowed ? "✓" : "✗"}
                  </span>
                  <span className={`font-medium ${allowed ? "text-slate-700" : "text-slate-400"}`}>{perm}</span>
                </div>
              );
            })}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
