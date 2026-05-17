"use client";
import { useState } from "react";
import { SectionHeader, SettingsCard, Label, Input, Toggle, SaveButton } from "./shared";
import { Upload, Mail, Phone, Globe, MapPin, User } from "lucide-react";

export default function SchoolInfoPanel() {
  const [form, setForm] = useState({
    name: "Kids Wellness Academy",
    address: "123 Rainbow Street, Kolkata",
    phone: "+91 98765 43210",
    email: "admin@kidswellness.edu",
    website: "www.kidswellness.edu",
    motto: "Every Child Deserves to Smile",
    principalName: "Dr. Sunita Sharma",
    adminContact: "+91 98765 00001",
    emergencyContact: "+91 98765 00002",
    themeColor: "#7c3aed",
  });
  const f = (k: keyof typeof form) => (v: string) => setForm(s => ({ ...s, [k]: v }));

  return (
    <div className="space-y-8 max-w-2xl">
      <SectionHeader title="School Information" description="Configure your school's identity, contacts, and branding details." />

      {/* School Details */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><span className="text-lg">🏫</span> School Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Label>School Name</Label><Input value={form.name} onChange={f("name")} placeholder="School Name" /></div>
          <div className="col-span-2">
            <Label>School Logo</Label>
            <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all group">
              <Upload className="w-8 h-8 text-purple-300 group-hover:text-purple-500 mx-auto mb-2 transition-colors" />
              <p className="text-sm font-bold text-slate-500 group-hover:text-purple-600">Click to upload logo</p>
              <p className="text-xs text-slate-400">PNG, JPG up to 2MB</p>
            </div>
          </div>
          <div className="col-span-2"><Label><MapPin className="w-3 h-3 inline mr-1" />Address</Label><Input value={form.address} onChange={f("address")} placeholder="School Address" /></div>
          <div><Label><Phone className="w-3 h-3 inline mr-1" />Phone</Label><Input value={form.phone} onChange={f("phone")} placeholder="Phone" /></div>
          <div><Label><Mail className="w-3 h-3 inline mr-1" />Email</Label><Input value={form.email} onChange={f("email")} placeholder="Email" type="email" /></div>
          <div className="col-span-2"><Label><Globe className="w-3 h-3 inline mr-1" />Website</Label><Input value={form.website} onChange={f("website")} placeholder="Website" /></div>
        </div>
      </SettingsCard>

      {/* School Identity */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><span className="text-lg">✨</span> School Identity</h3>
        <div className="space-y-4">
          <div><Label>School Motto</Label><Input value={form.motto} onChange={f("motto")} placeholder="Your school motto" /></div>
          <div>
            <Label>Theme Color</Label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.themeColor} onChange={e => f("themeColor")(e.target.value)} className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer" />
              <span className="font-mono text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">{form.themeColor}</span>
              <div className="flex-1 h-10 rounded-xl" style={{ background: `linear-gradient(135deg, ${form.themeColor}, ${form.themeColor}88)` }} />
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Principal Info */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><span className="text-lg">👤</span> Principal & Staff</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Label><User className="w-3 h-3 inline mr-1" />Principal Name</Label><Input value={form.principalName} onChange={f("principalName")} placeholder="Principal Name" /></div>
          <div><Label>Admin Contact</Label><Input value={form.adminContact} onChange={f("adminContact")} placeholder="Admin Phone" /></div>
          <div><Label>Emergency Contact</Label><Input value={form.emergencyContact} onChange={f("emergencyContact")} placeholder="Emergency Phone" /></div>
        </div>
      </SettingsCard>

      <div className="flex justify-end pt-2">
        <SaveButton onSave={() => console.log("School info saved:", form)} />
      </div>
    </div>
  );
}
