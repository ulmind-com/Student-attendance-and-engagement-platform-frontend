"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader, SettingsCard, Label, Input, SaveButton } from "./shared";
import { Plus, Trash2, Shield, User, KeyRound, Eye, EyeOff, CheckCircle2, X } from "lucide-react";

type AdminUser = { id: string; username: string; role: string; created_at: string };

const ROLES = ["Super Admin", "Teacher", "Parent Viewer"];
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-8 left-1/2 -translate-x-1/2 z-[300] px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
        type === "success"
          ? "bg-slate-800/95 border-white/10 text-white"
          : "bg-red-600/95 border-red-400/20 text-white"
      }`}
    >
      {type === "success"
        ? <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
        : <X className="w-5 h-5 text-red-200 flex-shrink-0" />}
      <span className="font-bold text-sm">{message}</span>
    </motion.div>
  );
}

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ username: "", password: "", role: "Teacher" });
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/admin-users`);
      if (res.ok) setUsers(await res.json());
    } catch { showToast("Failed to load admin users", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) return;
    try {
      const res = await fetch(`${API}/admin-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast(`✅ Admin "${form.username}" added successfully!`);
        setForm({ username: "", password: "", role: "Teacher" });
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.detail || "Failed to add user", "error");
      }
    } catch { showToast("Network error", "error"); }
  };

  const handleDelete = async (username: string) => {
    try {
      const res = await fetch(`${API}/admin-users/${encodeURIComponent(username)}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`🗑️ Admin "${username}" deleted successfully!`);
        setUsers(u => u.filter(x => x.username !== username));
      } else {
        showToast("Failed to delete user", "error");
      }
    } catch { showToast("Network error", "error"); }
    finally { setConfirmDelete(null); }
  };

  const roleColor = (role: string) => {
    if (role === "Super Admin") return "bg-purple-100 text-purple-700";
    if (role === "Teacher") return "bg-blue-100 text-blue-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-8 max-w-2xl relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-black text-slate-800 text-lg text-center mb-1">Delete Admin?</h3>
              <p className="text-slate-500 text-sm text-center mb-6">
                Are you sure you want to delete <strong className="text-slate-800">"{confirmDelete}"</strong>? This cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all">
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 active:scale-95 transition-all shadow-md shadow-red-200">
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SectionHeader title="Admin User Management" description="Add, manage, and remove admin accounts. All changes are saved to the database." />

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Admins", value: users.length, color: "from-purple-500 to-violet-600", icon: "👑" },
          { label: "Super Admins", value: users.filter(u => u.role === "Super Admin").length, color: "from-blue-500 to-indigo-600", icon: "🛡️" },
          { label: "Teachers", value: users.filter(u => u.role === "Teacher").length, color: "from-green-500 to-teal-500", icon: "👩‍🏫" },
        ].map(stat => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white text-center`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-black">{stat.value}</div>
            <div className="text-xs font-bold opacity-80 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Current Admins List */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-500" /> Admin Accounts
        </h3>
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium">No admin accounts yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-purple-50/50 hover:border-purple-100 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-slate-800 text-sm">{user.username}</div>
                  <div className="text-xs text-slate-400 font-medium">Added: {user.created_at}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black flex-shrink-0 ${roleColor(user.role)}`}>
                  {user.role}
                </span>
                <button
                  onClick={() => setConfirmDelete(user.username)}
                  className="p-2 rounded-xl hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </SettingsCard>

      {/* Add New Admin Form */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2">
          <Plus className="w-4 h-4 text-green-500" /> Add New Admin
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm font-bold text-slate-800"
                  required
                />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Set password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm font-bold text-slate-800"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <Label>Role</Label>
            <div className="flex gap-2">
              {ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-1 ${
                    form.role === role
                      ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black text-sm shadow-lg shadow-purple-200 hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Admin Account
          </motion.button>
        </form>
      </SettingsCard>

      {/* Security Note */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">🔐</span>
        <div>
          <p className="text-sm font-black text-amber-800">Security Reminder</p>
          <p className="text-xs text-amber-700 font-medium mt-0.5">
            Always use strong passwords for admin accounts. The default <code className="bg-amber-100 px-1 rounded">admin/admin123</code> should be changed after first login.
          </p>
        </div>
      </div>
    </div>
  );
}
