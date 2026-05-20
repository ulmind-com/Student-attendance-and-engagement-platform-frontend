"use client";
import { useState, useEffect, useRef } from "react";
import { SectionHeader, SettingsCard, Label, Input, SaveButton } from "./shared";
import { Plus, Trash2, Edit3, Users, GraduationCap, BookOpen, Loader2 } from "lucide-react";

type ClassItem = { id: number; name: string; teacher: string; students: number; limit: number };
type TeacherItem = { id: number; name: string; subject: string; classes: string[] };

const ROLES = ["Super Admin", "Teacher", "Parent Viewer"] as const;
const PERMISSIONS: Record<string, { label: string; allowed: string[] }> = {
  "Super Admin": { label: "Full Access", allowed: ["View reports", "Manage attendance", "Delete students", "Configure settings", "Manage teachers"] },
  "Teacher": { label: "Standard Access", allowed: ["View reports", "Manage attendance", "Add wellness notes"] },
  "Parent Viewer": { label: "Read Only", allowed: ["View own child report"] },
};

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ClassesUsersPanel() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const classesRef = useRef(classes);
  const teachersRef = useRef(teachers);
  classesRef.current = classes;
  teachersRef.current = teachers;

  // ── Fetch on mount ──
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/settings/classes`);
      const data = await res.json();
      if (data && Array.isArray(data.classes)) {
        setClasses(data.classes);
        setTeachers(data.teachers || []);
      } else if (Array.isArray(data)) {
        setClasses(data);
      } else {
        setClasses([
          { id: 1, name: "Nursery-A", teacher: "Emma Watson", students: 18, limit: 30 },
          { id: 2, name: "Nursery-B", teacher: "Priya Sharma", students: 22, limit: 30 },
          { id: 3, name: "KG-A", teacher: "Anita Roy", students: 15, limit: 25 },
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

  // ── Save to server (called after every add/delete) ──
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
  const [newClass, setNewClass] = useState({ name: "", teacher: "", limit: "30" });
  const addClass = async () => {
    if (!newClass.name) return;
    const updated = [...classesRef.current, { id: Date.now(), name: newClass.name, teacher: newClass.teacher, students: 0, limit: Number(newClass.limit) }];
    setClasses(updated);
    setNewClass({ name: "", teacher: "", limit: "30" });
    await saveToServer(updated, teachersRef.current);
  };
  const deleteClass = async (id: number) => {
    const updated = classesRef.current.filter(x => x.id !== id);
    setClasses(updated);
    await saveToServer(updated, teachersRef.current);
  };

  // ── Teacher actions ──
  const [newTeacher, setNewTeacher] = useState({ name: "", subject: "" });
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

  const [activeRole, setActiveRole] = useState<string>("Teacher");

  return (
    <div className="space-y-8 max-w-2xl">
      <SectionHeader title="Classes & Users" description="Manage class rooms, teachers, and user permissions." />

      {/* Status bar */}
      {(isSaving || saveMsg) && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${isSaving ? "bg-blue-50 text-blue-600" : saveMsg.startsWith("✓") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSaving ? "Saving to database..." : saveMsg}
        </div>
      )}

      {/* Class Management */}
      <SettingsCard>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-slate-800 flex items-center gap-2"><BookOpen className="w-4 h-4 text-green-500" /> Class Management</h3>
        </div>
        <div className="space-y-2 mb-4">
          {classes.map(cls => (
            <div key={cls.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{cls.name}</div>
                  <div className="text-xs text-slate-500">Teacher: {cls.teacher} • {cls.students}/{cls.limit} students</div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-red-50 rounded-lg" onClick={() => deleteClass(cls.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Add Class Form */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-100 space-y-3">
          <div className="text-xs font-bold text-green-700 uppercase tracking-wider flex items-center gap-1"><Plus className="w-3 h-3" /> Add New Class</div>
          <div className="grid grid-cols-3 gap-2">
            <Input value={newClass.name} onChange={v => setNewClass(s => ({ ...s, name: v }))} placeholder="Class name" />
            <Input value={newClass.teacher} onChange={v => setNewClass(s => ({ ...s, teacher: v }))} placeholder="Teacher" />
            <Input value={newClass.limit} onChange={v => setNewClass(s => ({ ...s, limit: v }))} placeholder="Limit" type="number" />
          </div>
          <button onClick={addClass} disabled={isSaving} className="w-full py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50">
            {isSaving ? "Saving..." : "Add Class"}
          </button>
        </div>
      </SettingsCard>

      {/* Teacher Management */}
      <SettingsCard>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-slate-800 flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> Teacher Management</h3>
        </div>
        <div className="space-y-2 mb-4">
          {teachers.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.subject} • {t.classes.join(", ") || "No class assigned"}</div>
                </div>
              </div>
              <button className="p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteTeacher(t.id)}>
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-3">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1"><Plus className="w-3 h-3" /> Add Teacher</div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={newTeacher.name} onChange={v => setNewTeacher(s => ({ ...s, name: v }))} placeholder="Teacher name" />
            <Input value={newTeacher.subject} onChange={v => setNewTeacher(s => ({ ...s, subject: v }))} placeholder="Subject / Role" />
          </div>
          <button onClick={addTeacher} disabled={isSaving} className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50">
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
