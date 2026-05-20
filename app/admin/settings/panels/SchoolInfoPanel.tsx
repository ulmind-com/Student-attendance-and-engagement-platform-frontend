"use client";
import { useState, useEffect, useRef } from "react";
import { SectionHeader, SettingsCard, Label, Input, SaveButton } from "./shared";
import { Upload, Mail, Phone, Globe, MapPin, User, Loader2, Check, Image as ImageIcon, X } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const DEFAULT = {
  name: "",
  logo: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  motto: "",
  themeColor: "#7c3aed",
  principalName: "",
  principalPhoto: "",
  adminContact: "",
  emergencyContact: "",
};

export default function SchoolInfoPanel() {
  const [form, setForm] = useState(DEFAULT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [principalPhotoUploading, setPrincipalPhotoUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const principalPhotoRef = useRef<HTMLInputElement>(null);

  const f = (k: keyof typeof form) => (v: string) => setForm(s => ({ ...s, [k]: v }));

  // ── Load from DB ──
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/settings/school`);
        if (res.ok) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            setForm(prev => ({ ...prev, ...data }));
          }
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, []);

  // ── Save to DB ──
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`${API}/settings/school`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveMsg("✓ All changes saved!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) {
      console.error(e);
      setSaveMsg("⚠ Failed to save!");
      setTimeout(() => setSaveMsg(""), 3000);
    } finally { setIsSaving(false); }
  };

  // ── Cloudinary Upload ──
  const uploadToCloudinary = async (file: File, field: "logo" | "principalPhoto") => {
    const setter = field === "logo" ? setLogoUploading : setPrincipalPhotoUploading;
    setter(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", UPLOAD_PRESET || "students_unsigned");
      fd.append("folder", "school_settings");
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.secure_url) {
        setForm(prev => ({ ...prev, [field]: data.secure_url }));
      }
    } catch (e) { console.error(e); }
    finally { setter(false); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <span className="ml-3 font-bold text-slate-500">Loading school settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <SectionHeader title="School Information" description="Configure your school's identity, contacts, and branding details." />

      {/* Status bar */}
      {(isSaving || saveMsg) && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isSaving ? "bg-blue-50 text-blue-600 border border-blue-100" : saveMsg.startsWith("✓") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSaving ? "Saving to database..." : saveMsg}
        </div>
      )}

      {/* School Details */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><span className="text-lg">🏫</span> School Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Label>School Name</Label><Input value={form.name} onChange={f("name")} placeholder="School Name" /></div>

          {/* Logo Upload */}
          <div className="col-span-2">
            <Label>School Logo</Label>
            <input type="file" ref={logoRef} accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadToCloudinary(e.target.files[0], "logo"); }} />
            {form.logo ? (
              <div className="relative group w-fit">
                <div className="w-28 h-28 rounded-2xl border-2 border-purple-200 overflow-hidden bg-white shadow-sm">
                  <img src={form.logo} alt="School Logo" className="w-full h-full object-contain p-2" />
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => logoRef.current?.click()} className="p-2 bg-white rounded-xl shadow-lg hover:bg-purple-50 transition-colors">
                    <Upload className="w-4 h-4 text-purple-600" />
                  </button>
                  <button onClick={() => setForm(prev => ({ ...prev, logo: "" }))} className="p-2 bg-white rounded-xl shadow-lg hover:bg-red-50 transition-colors">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => logoRef.current?.click()}
                className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all group"
              >
                {logoUploading ? (
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-purple-300 group-hover:text-purple-500 mx-auto mb-2 transition-colors" />
                )}
                <p className="text-sm font-bold text-slate-500 group-hover:text-purple-600">{logoUploading ? "Uploading..." : "Click to upload logo"}</p>
                <p className="text-xs text-slate-400">PNG, JPG up to 2MB</p>
              </div>
            )}
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
              <div className="flex-1 h-10 rounded-xl shadow-inner" style={{ background: `linear-gradient(135deg, ${form.themeColor}, ${form.themeColor}88)` }} />
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Principal Info */}
      <SettingsCard>
        <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2"><span className="text-lg">👤</span> Principal & Staff</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label><User className="w-3 h-3 inline mr-1" />Principal Name</Label>
            <Input value={form.principalName} onChange={f("principalName")} placeholder="Principal Name" />
          </div>

          {/* Principal Photo */}
          <div className="col-span-2">
            <Label>Principal Photo</Label>
            <input type="file" ref={principalPhotoRef} accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadToCloudinary(e.target.files[0], "principalPhoto"); }} />
            <div className="flex items-center gap-4">
              {form.principalPhoto ? (
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full border-2 border-blue-200 overflow-hidden bg-white shadow-sm">
                    <img src={form.principalPhoto} alt="Principal" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button onClick={() => principalPhotoRef.current?.click()} className="p-1.5 bg-white rounded-lg shadow-lg"><Upload className="w-3 h-3 text-blue-600" /></button>
                    <button onClick={() => setForm(prev => ({ ...prev, principalPhoto: "" }))} className="p-1.5 bg-white rounded-lg shadow-lg"><X className="w-3 h-3 text-red-500" /></button>
                  </div>
                </div>
              ) : (
                <button onClick={() => principalPhotoRef.current?.click()} className="w-20 h-20 rounded-full border-2 border-dashed border-blue-200 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                  {principalPhotoUploading ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <ImageIcon className="w-5 h-5 text-blue-300" />}
                  <span className="text-[9px] font-bold text-blue-400 mt-0.5">Photo</span>
                </button>
              )}
              <div className="text-xs text-slate-400">Upload principal's photo (optional)</div>
            </div>
          </div>

          <div><Label>Admin Contact</Label><Input value={form.adminContact} onChange={f("adminContact")} placeholder="Admin Phone" /></div>
          <div><Label>Emergency Contact</Label><Input value={form.emergencyContact} onChange={f("emergencyContact")} placeholder="Emergency Phone" /></div>
        </div>
      </SettingsCard>

      <div className="flex items-center justify-between pt-2">
        {saveMsg && !isSaving && (
          <div className={`flex items-center gap-1.5 text-sm font-bold ${saveMsg.startsWith("✓") ? "text-emerald-600" : "text-red-600"}`}>
            {saveMsg.startsWith("✓") && <Check className="w-4 h-4" />}
            {saveMsg}
          </div>
        )}
        <div className="ml-auto">
          <SaveButton onSave={handleSave} label={isSaving ? "Saving..." : "Save School Info"} />
        </div>
      </div>
    </div>
  );
}
