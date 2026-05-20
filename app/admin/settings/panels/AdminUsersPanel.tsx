"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader, SettingsCard, Label } from "./shared";
import { Plus, Trash2, Shield, User, KeyRound, Eye, EyeOff, CheckCircle2, X, Edit3, Save, Loader2, Crown, GraduationCap } from "lucide-react";

type AdminUser = { id: string; username: string; role: string; created_at: string };
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
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
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ username: "", password: "" });
  const [showEditPw, setShowEditPw] = useState(false);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast(`✅ ${form.role} "${form.username}" added successfully!`);
        setForm({ username: "", password: "", role: "Teacher" });
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.detail || "Failed to add user", "error");
      }
    } catch { showToast("Network error", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (username: string) => {
    try {
      const res = await fetch(`${API}/admin-users/${encodeURIComponent(username)}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`🗑️ "${username}" deleted successfully!`);
        setUsers(u => u.filter(x => x.username !== username));
      } else {
        showToast("Failed to delete user", "error");
      }
    } catch { showToast("Network error", "error"); }
    finally { setConfirmDelete(null); }
  };

  const handleUpdate = async (oldUsername: string) => {
    if (!editForm.username.trim()) return;
    setSaving(true);
    try {
      const body: any = {};
      if (editForm.username !== oldUsername) body.new_username = editForm.username;
      if (editForm.password) body.new_password = editForm.password;
      if (!body.new_username && !body.new_password) {
        setEditingUser(null);
        setSaving(false);
        return;
      }
      const res = await fetch(`${API}/admin-users/${encodeURIComponent(oldUsername)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast(`✅ "${oldUsername}" updated successfully!`);
        // Update localStorage if the current user changed their own credentials
        const currentUser = localStorage.getItem("adminUsername");
        if (currentUser === oldUsername && body.new_username) {
          localStorage.setItem("adminUsername", body.new_username);
        }
        fetchUsers();
        setEditingUser(null);
        setEditForm({ username: "", password: "" });
      } else {
        const err = await res.json();
        showToast(err.detail || "Failed to update", "error");
      }
    } catch { showToast("Network error", "error"); }
    finally { setSaving(false); }
  };

  const superAdmin = users.find(u => u.role === "Super Admin");
  const teacherUsers = users.filter(u => u.role === "Teacher");

  return (
    <div className="space-y-8 max-w-2xl relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} />}
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
              <h3 className="font-black text-slate-800 text-lg text-center mb-1">Delete Account?</h3>
              <p className="text-slate-500 text-sm text-center mb-6">
                Are you sure you want to delete <strong className="text-slate-800">&quot;{confirmDelete}&quot;</strong>? This cannot be undone.
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

      <SectionHeader title="Admin User Management" description="Manage Super Admin credentials and Teacher login accounts." />

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Super Admin", value: superAdmin ? 1 : 0, color: "from-purple-500 to-violet-600", icon: Crown },
          { label: "Teacher Accounts", value: teacherUsers.length, color: "from-blue-500 to-indigo-600", icon: GraduationCap },
        ].map(stat => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-8 translate-x-8 blur-xl" />
            <div className="relative z-10">
              <stat.icon className="w-6 h-6 mb-2 text-white/80" />
              <div className="text-3xl font-black">{stat.value}</div>
              <div className="text-xs font-bold opacity-80 mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Super Admin Section ── */}
      <SettingsCard>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm">Super Admin Account</h3>
            <p className="text-[10px] text-slate-400 font-medium">Full access to all settings and features</p>
          </div>
        </div>

        {loading ? (
          <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
        ) : superAdmin ? (
          <div className="space-y-3">
            {editingUser === superAdmin.username ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 bg-purple-50 rounded-2xl p-4 border border-purple-100">
                <div>
                  <Label>Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <input value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-purple-200 rounded-xl outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm font-bold text-slate-800" />
                  </div>
                </div>
                <div>
                  <Label>New Password (leave blank to keep current)</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <input type={showEditPw ? "text" : "password"} value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Enter new password..."
                      className="w-full pl-10 pr-10 py-3 bg-white border border-purple-200 rounded-xl outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm font-bold text-slate-800" />
                    <button type="button" onClick={() => setShowEditPw(!showEditPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600">
                      {showEditPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingUser(null); setEditForm({ username: "", password: "" }); }}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all">
                    Cancel
                  </button>
                  <button onClick={() => handleUpdate(superAdmin.username)} disabled={saving}
                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:from-purple-700 hover:to-violet-700 active:scale-95 transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-200">
                  {superAdmin.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-slate-800">{superAdmin.username}</div>
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Crown className="w-3 h-3 text-purple-500" /> Super Admin · Added: {superAdmin.created_at}
                  </div>
                </div>
                <button
                  onClick={() => { setEditingUser(superAdmin.username); setEditForm({ username: superAdmin.username, password: "" }); setShowEditPw(false); }}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold text-xs hover:bg-purple-200 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No Super Admin found. Create one below.</p>
          </div>
        )}
      </SettingsCard>

      {/* ── Teacher Accounts ── */}
      <SettingsCard>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm">Teacher Accounts</h3>
              <p className="text-[10px] text-slate-400 font-medium">Manage teacher login credentials</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black">{teacherUsers.length} teachers</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : teacherUsers.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium text-sm">No teacher accounts yet. Add one below.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {teacherUsers.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              >
                {editingUser === user.username ? (
                  <div className="space-y-3 bg-blue-50 rounded-2xl p-4 border border-blue-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Username</Label>
                        <input value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl outline-none focus:border-blue-400 text-sm font-bold text-slate-800" />
                      </div>
                      <div>
                        <Label>New Password</Label>
                        <input type={showEditPw ? "text" : "password"} value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                          placeholder="Leave blank to keep"
                          className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl outline-none focus:border-blue-400 text-sm font-bold text-slate-800" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingUser(null); setEditForm({ username: "", password: "" }); }}
                        className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 active:scale-95 transition-all">Cancel</button>
                      <button onClick={() => handleUpdate(user.username)} disabled={saving}
                        className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xs active:scale-95 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-1.5">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-blue-50/50 hover:border-blue-100 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-slate-800 text-sm">{user.username}</div>
                      <div className="text-xs text-slate-400 font-medium">Teacher · {user.created_at}</div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingUser(user.username); setEditForm({ username: user.username, password: "" }); setShowEditPw(false); }}
                        className="p-2 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button onClick={() => setConfirmDelete(user.username)}
                        className="p-2 rounded-xl hover:bg-red-100 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </SettingsCard>

      {/* ── Add New Account ── */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2">
          <Plus className="w-4 h-4 text-green-500" /> Add New Account
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
              {(["Super Admin", "Teacher"] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role }))}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-1 flex items-center justify-center gap-2 ${
                    form.role === role
                      ? role === "Super Admin"
                        ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-200"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {role === "Super Admin" ? <Crown className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                  {role}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black text-sm shadow-lg shadow-purple-200 hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? "Adding..." : "Add Account"}
          </motion.button>
        </form>
      </SettingsCard>

      {/* Security Note */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">🔐</span>
        <div>
          <p className="text-sm font-black text-amber-800">Security Reminder</p>
          <p className="text-xs text-amber-700 font-medium mt-0.5">
            Only Super Admins can access this panel. Teachers can login to the admin dashboard but cannot manage user accounts.
            Default credentials <code className="bg-amber-100 px-1 rounded">admin/admin123</code> should be changed after first login.
          </p>
        </div>
      </div>
    </div>
  );
}
