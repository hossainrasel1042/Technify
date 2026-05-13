"use client";

import { useState, useRef,useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, ArrowRight, Camera } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";

// ─── Types ────────────────────────────────────────────────────────────────────

type LoginState = { email: string; password: string };
type SignupState = {
  display_name: string;
  email: string;
  phone: string;
  bio: string;
  password: string;
  confirm_password: string;
};

type LoginErrors  = Partial<Record<keyof LoginState,  string>>;
type SignupErrors = Partial<Record<keyof SignupState, string>>;

// ─── Validators ───────────────────────────────────────────────────────────────

function validateLogin(v: LoginState): LoginErrors {
  const e: LoginErrors = {};
  if (!v.email.trim()) e.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Enter a valid email address.";
  if (!v.password.trim()) e.password = "Password is required.";
  else if (v.password.length < 8) e.password = "Password must be at least 8 characters.";
  return e;
}

function validateSignup(v: SignupState): SignupErrors {
  const e: SignupErrors = {};
  if (!v.display_name.trim()) e.display_name = "Display name is required.";
  if (!v.email.trim()) e.email = "Email is required.";
  if (!v.bio.trim()) e.bio = "Bio is required.";
  if (!v.phone.trim()) e.phone = "Phone number is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Enter a valid email address.";
  if (v.phone && !/^\+?[\d\s\-()]{7,20}$/.test(v.phone)) e.phone = "Enter a valid phone number.";
  if (!v.password.trim()) e.password = "Password is required.";
  else if (v.password.length < 8) e.password = "Password must be at least 8 characters.";
  if (!v.confirm_password.trim()) e.confirm_password = "Please confirm your password.";
  else if (v.confirm_password !== v.password) e.confirm_password = "Passwords do not match.";
  if(v.bio.length > 160) e.bio = "Bio must be 160 characters or less.";
  if(v.display_name.length > 50) e.display_name = "Display name must be 50 characters or less.";
  if(v.phone.length > 11) e.phone = "Phone number must be 11 characters or less.";
  if(v.email.length > 255) e.email = "Email must be 255 characters or less.";
  
  return e;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const inputBase =
  "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[oklch(0.55_0.2_170)] focus:ring-1 focus:ring-[oklch(0.55_0.2_170)]/30 transition-all duration-200 disabled:opacity-50";
const errorBorder =
  "border-red-500/50 focus:border-red-500 focus:ring-red-500/20";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-400 text-xs mt-1.5 ml-1">{msg}</p>;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs text-white/50 mb-1.5 font-mono tracking-wider">
      {children}
    </label>
  );
}

// ─── Avatar Upload ─────────────────────────────────────────────────────────────

function AvatarUpload({
  preview,
  onChange,
  disabled,
}: {
  preview: string | null;
  onChange: (file: File, dataUrl: string) => void;
  disabled: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(file, reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-2 mb-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => ref.current?.click()}
        className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-white/15 hover:border-[oklch(0.55_0.2_170)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[oklch(0.55_0.2_170)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Upload profile photo"
      >
        {/* Background fill */}
        <div className="absolute inset-0 bg-white/5" />

        {/* Preview image */}
        {preview ? (
          <img
            src={preview}
            alt="Profile preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white/20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </div>
      </button>

      <span className="text-[10px] text-white/30 font-mono tracking-wider uppercase">
        {preview ? "Click to change" : "Upload photo"}
      </span>

      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFile}
        disabled={disabled}
      />
    </div>
  );
}

// ─── Login Form ────────────────────────────────────────────────────────────────

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState<LoginState>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [authError, setAuthError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof LoginState]) setErrors((p) => ({ ...p, [name]: undefined }));
    if (authError) setAuthError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateLogin(form);
    if (Object.keys(v).length) { setErrors(v); return; }
    setStatus("loading");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      if (!res.ok) { setAuthError("Incorrect email or password."); setStatus("idle"); return; }
      const data = await res.json();
document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      router.push("/admin");
    } catch {
      setAuthError("Incorrect email or password.");
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {authError && (
        <div
          className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{
            background: "oklch(0.55 0.2 170 / 0.1)",
            color: "oklch(0.75 0.2 170)",
            border: "1px solid oklch(0.55 0.2 170 / 0.25)",
          }}
        >
          {authError}
        </div>
      )}

      {/* Email */}
      <div>
        <Label>EMAIL</Label>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          disabled={status === "loading"}
          autoComplete="email"
          className={`${inputBase} ${errors.email ? errorBorder : ""}`}
        />
        <FieldError msg={errors.email} />
      </div>

      {/* Password */}
      <div>
        <Label>PASSWORD</Label>
        <div className="relative">
          <input
            name="password"
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            disabled={status === "loading"}
            autoComplete="current-password"
            className={`${inputBase} pr-11 ${errors.password ? errorBorder : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            tabIndex={-1}
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <FieldError msg={errors.password} />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={status === "loading"}
        className="w-full h-11 mt-2 text-sm font-medium text-black group disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ background: "oklch(0.55 0.2 170)" }}
      >
        {status === "loading" ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in…</>
        ) : (
          <>Sign in<ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" /></>
        )}
      </Button>

      <p className="text-center text-xs text-white/35 mt-1">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium transition-colors"
          style={{ color: "oklch(0.7 0.2 170)" }}
        >
          Create one
        </button>
      </p>
    </form>
  );
}

// ─── Signup Form ───────────────────────────────────────────────────────────────

function SignupForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState<SignupState>({
    display_name: "", email: "", phone: "", bio: "", password: "", confirm_password: "",
  });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [apiError, setApiError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof SignupState]) setErrors((p) => ({ ...p, [name]: undefined }));
    if (apiError) setApiError(null);
  };

  const handleAvatar = (file: File, dataUrl: string) => {
    setAvatarFile(file);
    setAvatarPreview(dataUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateSignup(form);
    if (Object.keys(v).length) { setErrors(v); return; }
     if (!avatarFile) {
  setApiError("Profile image is required.");
  return;
}
    setStatus("loading");
    try {
      const body = new FormData();
      body.append("display_name", form.display_name);
      body.append("email", form.email);
      body.append("phone", form.phone);
      body.append("bio", form.bio);
      body.append("password", form.password);
      body.append("profile_img", avatarFile);
     
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/register`, {
        method: "POST",
        body,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setApiError(data?.message ?? "Registration failed. Please try again.");
        setStatus("idle");
        return;
      }

      const data = await res.json();
document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      router.push("/admin");
    } catch {
      setApiError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {apiError && (
        <div
          className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{
            background: "oklch(0.55 0.2 170 / 0.1)",
            color: "oklch(0.75 0.2 170)",
            border: "1px solid oklch(0.55 0.2 170 / 0.25)",
          }}
        >
          {apiError}
        </div>
      )}

      {/* Avatar */}
      <AvatarUpload
        preview={avatarPreview}
        onChange={handleAvatar}
        disabled={status === "loading"}
      />

      {/* Display Name */}
      <div>
        <Label>DISPLAY NAME</Label>
        <input
          name="display_name"
          type="text"
          placeholder="Your name"
          value={form.display_name}
          onChange={handleChange}
          disabled={status === "loading"}
          autoComplete="name"
          className={`${inputBase} ${errors.display_name ? errorBorder : ""}`}
        />
        <FieldError msg={errors.display_name} />
      </div>

      {/* Email */}
      <div>
        <Label>EMAIL</Label>
        <input
          name="email"
          type="email"
          placeholder="hossain@gmail.com"
          value={form.email}
          onChange={handleChange}
          disabled={status === "loading"}
          autoComplete="email"
          className={`${inputBase} ${errors.email ? errorBorder : ""}`}
        />
        <FieldError msg={errors.email} />
      </div>

      {/* Phone */}
      <div>
        <Label>PHONE</Label>
        <input
          name="phone"
          type="tel"
          placeholder="01855492253"
          value={form.phone}
          onChange={handleChange}
          disabled={status === "loading"}
          autoComplete="tel"
          className={`${inputBase} ${errors.phone ? errorBorder : ""}`}
        />
        <FieldError msg={errors.phone} />
      </div>

      {/* Bio */}
      <div>
        <Label>BIO</Label>
        <textarea
          name="bio"
          placeholder="Tell us a little about yourself…"
          value={form.bio}
          onChange={handleChange}
          disabled={status === "loading"}
          rows={3}
          className={`${inputBase} resize-none leading-relaxed`}
        />
        <FieldError msg={errors.bio} />
      </div>

      {/* Password */}
      <div>
        <Label>PASSWORD</Label>
        <div className="relative">
          <input
            name="password"
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            disabled={status === "loading"}
            autoComplete="new-password"
            className={`${inputBase} pr-11 ${errors.password ? errorBorder : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            tabIndex={-1}
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <FieldError msg={errors.password} />
      </div>

      {/* Confirm Password */}
      <div>
        <Label>CONFIRM PASSWORD</Label>
        <div className="relative">
          <input
            name="confirm_password"
            type={showCPw ? "text" : "password"}
            placeholder="••••••••"
            value={form.confirm_password}
            onChange={handleChange}
            disabled={status === "loading"}
            autoComplete="new-password"
            className={`${inputBase} pr-11 ${errors.confirm_password ? errorBorder : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowCPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            tabIndex={-1}
          >
            {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <FieldError msg={errors.confirm_password} />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={status === "loading"}
        className="w-full h-11 mt-2 text-sm font-medium text-black group disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ background: "oklch(0.55 0.2 170)" }}
      >
        {status === "loading" ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account…</>
        ) : (
          <>Create account<ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" /></>
        )}
      </Button>

      <p className="text-center text-xs text-white/35 mt-1">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium transition-colors"
          style={{ color: "oklch(0.7 0.2 170)" }}
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  return (
    <main className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden px-4 py-12">

      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Glow blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.55 0.2 170 / 0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span
              className="text-3xl font-semibold tracking-tight text-white"
              style={{ fontFamily: "var(--font-fredericka)" }}
            >
              TechNify
            </span>
          </Link>
          <p className="mt-2 text-xs text-white/40 tracking-widest font-mono uppercase">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
          {mode === "login" ? (
            <LoginForm onSwitch={() => setMode("signup")} />
          ) : (
            <SignupForm onSwitch={() => setMode("login")} />
          )}
        </div>

        <p className="text-center font-mono text-[10px] text-white/15 tracking-widest mt-8 uppercase">
          © {new Date().getFullYear()} Technify
        </p>
      </div>
    </main>
  );
}
