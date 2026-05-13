"use client";

import { useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDashboard } from "@/context/dashboardContext";
import {
  FolderOpen,
  CheckCircle2,
  Trash2,
  Loader2,
  ExternalLink,
  Pencil,
  Camera,
  X,
} from "lucide-react";

const VALID_STATUS = [
  "Planning",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
] as const;

type Status = (typeof VALID_STATUS)[number];

type Project = {
  id: string;
  title: string;
  client_name: string;
  project_url: string;
  status: Status;
  description: string;
  company_logo: string;
  created_at?: string;
};

const STATUS_COLORS: Record<Status, string> = {
  Planning: "oklch(0.6 0.15 260)",
  "In Progress": "oklch(0.55 0.2 170)",
  Completed: "oklch(0.6 0.18 145)",
  "On Hold": "oklch(0.65 0.18 60)",
  Cancelled: "oklch(0.55 0.2 15)",
};

const emptyForm = {
  title: "",
  client_name: "",
  project_url: "",
  status: "Planning" as Status,
  description: "",
  company_logo: "",
};

// ─── Logo Picker ──────────────────────────────────────────────────────────────

function LogoPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (base64: string) => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => ref.current?.click()}
        className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-white/15 hover:border-[oklch(0.55_0.2_170)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[oklch(0.55_0.2_170)]/40 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Upload company logo"
      >
        <div className="absolute inset-0 bg-white/5" />

        {value ? (
          <img
            src={value}
            alt="Logo preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Camera className="w-4 h-4 text-white" />
        </div>
      </button>

      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="flex items-center gap-1 text-[10px] text-white/30 hover:text-red-400 transition-colors font-mono tracking-wider uppercase"
        >
          <X className="w-3 h-3" /> Remove
        </button>
      )}

      {!value && (
        <span className="text-[10px] text-white/30 font-mono tracking-wider uppercase">
          Upload logo
        </span>
      )}

      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFile}
        disabled={disabled}
      />
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  project,
  onClose,
  onUpdated,
}: {
  project: Project;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [form, setForm] = useState({ ...project });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[oklch(0.55_0.2_170)] focus:ring-1 focus:ring-[oklch(0.55_0.2_170)]/20 transition-all";

  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/project", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdated();
        onClose();
      } else {
        setError(data.message ?? "Failed to update project.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Edit Project</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex justify-center">
            <LogoPicker
              value={form.company_logo}
              onChange={(base64) => setForm((p) => ({ ...p, company_logo: base64 }))}
              disabled={updating}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">Project Title</label>
              <input name="title" value={form.title} onChange={handle} className={inputCls} required disabled={updating} />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">Client Name</label>
              <input name="client_name" value={form.client_name} onChange={handle} className={inputCls} required disabled={updating} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">Project URL</label>
              <input name="project_url" value={form.project_url} onChange={handle} type="url" className={inputCls} required disabled={updating} />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">Status</label>
              <select name="status" value={form.status} onChange={handle} className={inputCls} required disabled={updating}>
                {VALID_STATUS.map((s) => (
                  <option key={s} value={s} className="bg-neutral-900">{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">Description</label>
            <textarea name="description" value={form.description} onChange={handle} rows={3} className={`${inputCls} resize-none`} required disabled={updating} />
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose} disabled={updating} className="h-10 px-5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={updating} className="h-10 px-5 rounded-lg text-sm font-medium text-black flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-70" style={{ background: "oklch(0.55 0.2 170)" }}>
              {updating ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <>Update Project</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function ProjectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get("view") || "add";

  const { projects, loading, refreshData } = useDashboard();

  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshData();
        setSaved(true);
        setForm(emptyForm);
        setTimeout(() => {
          setSaved(false);
          router.push("?view=manage");
        }, 1200);
      } else {
        setError(data.message ?? "Failed to save project.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/project", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch {
      console.error("Failed to delete project");
    }
  };

  const handleUpdated = () => {
    refreshData();
  };

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[oklch(0.55_0.2_170)] focus:ring-1 focus:ring-[oklch(0.55_0.2_170)]/20 transition-all";

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      {editingProject && (
        <EditModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onUpdated={handleUpdated}
        />
      )}

      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {view === "manage" ? "Manage Projects" : "Add Project"}
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {view === "manage"
            ? "View and manage your portfolio projects."
            : "Add a new project to your portfolio."}
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {view === "add" ? (
        <form onSubmit={submit} className="flex flex-col gap-5">

          <div>
            <label className="block text-xs font-mono text-white/40 tracking-widest mb-3 uppercase">
              Company Logo
            </label>
            <LogoPicker
              value={form.company_logo}
              onChange={(base64) => setForm((p) => ({ ...p, company_logo: base64 }))}
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">
                Project Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handle}
                placeholder="E-commerce Redesign"
                className={inputCls}
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">
                Client Name
              </label>
              <input
                name="client_name"
                value={form.client_name}
                onChange={handle}
                placeholder="Acme Corp"
                className={inputCls}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">
                Project URL
              </label>
              <input
                name="project_url"
                value={form.project_url}
                onChange={handle}
                placeholder="https://example.com"
                type="url"
                className={inputCls}
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handle}
                className={inputCls}
                required
                disabled={submitting}
              >
                {VALID_STATUS.map((s) => (
                  <option key={s} value={s} className="bg-neutral-900">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handle}
              rows={4}
              placeholder="Briefly describe the project scope and outcome…"
              className={`${inputCls} resize-none`}
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 rounded-lg text-sm font-medium text-black transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 self-start disabled:opacity-70"
            style={{ background: "oklch(0.55 0.2 170)" }}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            ) : (
              <><FolderOpen className="w-4 h-4" /> Add Project</>
            )}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center text-white/50 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-white/40 text-sm p-4 bg-white/5 rounded-lg border border-white/10">
              No projects found.
            </div>
          ) : (
            (projects as Project[]).map((project) => (
              <div
                key={project.id}
                className="bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col sm:flex-row gap-4 justify-between items-start transition-colors hover:border-white/20"
              >
                <div className="flex gap-4 flex-1 min-w-0">
                  {project.company_logo && (
                    <img
                      src={project.company_logo}
                      alt={project.client_name}
                      className="w-10 h-10 rounded-full object-cover bg-white/10 shrink-0"
                      onError={(e) =>
                        ((e.currentTarget as HTMLImageElement).style.display = "none")
                      }
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-medium truncate">
                        {project.title}
                      </h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full shrink-0"
                        style={{
                          background: `${STATUS_COLORS[project.status]}22`,
                          color: STATUS_COLORS[project.status],
                          border: `1px solid ${STATUS_COLORS[project.status]}44`,
                        }}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mb-2">
                      {project.client_name}
                    </p>
                    <p className="text-sm text-white/60 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-xs text-white/40 hover:text-white/70 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {project.project_url}
                    </a>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="text-white/30 hover:text-blue-400 p-2 rounded-lg hover:bg-blue-400/10 transition-colors"
                    title="Edit Project"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-white/30 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="text-white/50 text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      }
    >
      <ProjectContent />
    </Suspense>
  );
}
