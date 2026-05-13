"use client";

import { FolderPlus, Star, Activity, Clock } from "lucide-react";
import { useDashboard } from "@/context/dashboardContext"; // <-- Import your context

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-white/40 tracking-widest uppercase">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.55 0.2 170 / 0.12)" }}>
          <Icon className="w-4 h-4" style={{ color: "oklch(0.55 0.2 170)" }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-semibold text-white tracking-tight">{value}</p>
        <p className="text-xs text-white/40 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// Small helper function to format dates cleanly
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function AdminDashboardPage() {
  // Use the global context
  const { projects, reviews, loading } = useDashboard();

  // Dynamic calculations
  const totalProjects = projects.length;
  const totalReviews = reviews.length;
  
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  // Grab only the 3 most recent for the dashboard preview
  const recentProjects = projects.slice(0, 3);
  const recentReviews = reviews.slice(0, 3);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-white/40 text-sm animate-pulse">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Overview</h1>
        <p className="text-sm text-white/40 mt-1">Welcome back to your Technify admin.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <StatCard 
          label="Projects" 
          value={totalProjects.toString()} 
          sub="Total in database" 
          icon={FolderPlus} 
        />
        <StatCard 
          label="Reviews" 
          value={totalReviews.toString()} 
          sub={`${avgRating} avg rating`} 
          icon={Star} 
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Recent Projects</h2>
        </div>
        <div className="divide-y divide-white/5">
          {recentProjects.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-white/40">No projects found. Add one to get started.</div>
          ) : (
            recentProjects.map((p) => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div>
                  <p className="text-sm text-white font-medium">{p.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{p.client_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-mono ${
                    p.status === "Live" || p.status === "Completed" 
                      ? "bg-[oklch(0.55_0.2_170/0.15)] text-[oklch(0.75_0.2_170)]" 
                      : p.status === "In Progress" || p.status === "Planning"
                      ? "bg-yellow-400/10 text-yellow-400" 
                      : "bg-white/10 text-white/50"
                  }`}>
                    {p.status}
                  </span>
                  <span className="text-xs text-white/30 hidden sm:inline-block">
                    {formatDate(p.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-medium text-white">Recent Reviews</h2>
        </div>
        <div className="divide-y divide-white/5">
          {recentReviews.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-white/40">No reviews found.</div>
          ) : (
            recentReviews.map((r) => (
              <div key={r.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white font-medium">{r.client_name}</span>
                  <span className="text-xs text-white/30">{formatDate(r.created_at)}</span>
                </div>
                <div className="flex gap-0.5 mb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-3 h-3" 
                      style={{ 
                        color: i < r.rating ? "oklch(0.55 0.2 170)" : "transparent", 
                        fill: i < r.rating ? "oklch(0.55 0.2 170)" : "oklch(1 0 0 / 0.1)" 
                      }} 
                    />
                  ))}
                </div>
                <p className="text-xs text-white/50 line-clamp-2">{r.review_text}</p>
                <p className="text-[10px] font-mono text-white/30 mt-2 uppercase">{r.role_company}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
