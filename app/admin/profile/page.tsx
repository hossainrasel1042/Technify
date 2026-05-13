"use client";

import { useState, useEffect } from "react";
import { User, CheckCircle2, Loader2 } from "lucide-react";
import { useUser } from "@/context/userContext";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useUser();
  
  const [form, setForm] = useState({ 
    name: "Admin", 
    email: "admin@technify.dev", 
    bio: "",
    password: ""
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.display_name || "",
        email: user.email || "",
        bio: user.bio || "",
      }));
    }
  }, [user]);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          bio: form.bio,
          ...(form.password ? { password: form.password } : {}) 
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSaved(true);
        setForm((p) => ({ ...p, password: "" })); // Clear password field after save
        await refreshUser(); // Update the sidebar instantly
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(json.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[oklch(0.55_0.2_170)] focus:ring-1 focus:ring-[oklch(0.55_0.2_170)]/20 transition-all";

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Profile</h1>
        <p className="text-sm text-white/40 mt-1">Manage your admin account.</p>
      </div>

      <div className="flex items-center gap-5">
        {user?.profile_img ? (
          <img 
            src={user.profile_img} 
            alt="Profile" 
            className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-white/10"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-semibold text-black shrink-0" style={{ background: "oklch(0.55 0.2 170)" }}>
            {form.name.charAt(0).toUpperCase() || "A"}
          </div>
        )}
        
        <div>
          <p className="text-white font-medium">{loading ? "Loading..." : form.name}</p>
          <p className="text-sm text-white/40">{loading ? "..." : form.email}</p>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">Display Name</label>
            <input name="name" value={form.name} onChange={handle} className={inputCls} disabled={loading || saving} required />
          </div>
          <div>
            <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} className={inputCls} disabled={loading || saving} required />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handle} rows={3} className={`${inputCls} resize-none`} disabled={loading || saving} />
        </div>

        <div>
          <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">New Password</label>
          <input name="password" type="password" value={form.password} onChange={handle} placeholder="Leave blank to keep current" className={inputCls} disabled={loading || saving} />
        </div>

        <button type="submit" disabled={loading || saving} className="h-11 px-6 rounded-lg text-sm font-medium text-black transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 self-start" style={{ background: "oklch(0.55 0.2 170)" }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><User className="w-4 h-4" /> Save Profile</>}
        </button>
      </form>
    </div>
  );
}