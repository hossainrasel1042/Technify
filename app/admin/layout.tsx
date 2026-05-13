"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserProvider, useUser } from "@/context/userContext";
import { DashboardProvider, useDashboard } from "@/context/dashboardContext";
import {
  FolderPlus,
  Star,
  User,
  Activity,
  LayoutDashboard,
  Menu,
  Bell,
  LogOut,
  FolderKanban,
  Loader2,
} from "lucide-react";

type SubItem = { href: string; label: string; };
type NavItem = {
  id: string;
  href?: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  subItems?: SubItem[];
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    id: "project",
    label: "Project",
    icon: FolderKanban,
    badge: 2,
    subItems: [
      { href: "/admin/project?view=add", label: "Project Add" },
      { href: "/admin/project?view=manage", label: "Project Manage" },
    ],
  },
  { 
    id: "review", 
    label: "Reviews", 
    icon: Star,
    subItems: [
      { href: "/admin/review?view=add", label: "Add Review" },
      { href: "/admin/review?view=manage", label: "Manage Reviews" },
    ],
  },
  { id: "profile", href: "/admin/profile", label: "Profile", icon: User },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  
  // Logout Modal States
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  
  const { user, loading: userLoading } = useUser();
  const { loading: dashboardLoading } = useDashboard();

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // 1. Ask the server to destroy the HttpOnly cookie
      await fetch("/api/logout", { method: "POST" });
      
      // 2. Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
      setIsLoggingOut(false); // Reset if there's a network error
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={() => !isLoggingOut && setIsLogoutModalOpen(false)} 
          />
          <div className="relative z-10 w-full max-w-sm bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex flex-col gap-2">
              <h2 className="text-white font-semibold text-lg">Confirm Logout</h2>
              <p className="text-sm text-white/50">Are you sure you want to log out of the admin panel?</p>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                disabled={isLoggingOut}
                className="h-10 px-5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="h-10 px-5 rounded-lg text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20 flex items-center gap-2 transition-all disabled:opacity-70"
              >
                {isLoggingOut ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging out...</> : <>Log out</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0a0a0a] border-r border-white/10 z-30 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="px-6 py-6 border-b border-white/10">
          <Link href="/" className="inline-block">
            <span className="text-xl font-semibold text-white tracking-tight" style={{ fontFamily: "var(--font-fredericka)" }}>TechNify</span>
          </Link>
          <p className="text-[10px] font-mono text-white/30 tracking-widest mt-0.5 uppercase">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 min-h-[350px] overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.subItems && pathname.startsWith(`/admin/${item.id}`));

            return (
              <div 
                key={item.id} 
                onMouseEnter={() => {
                  if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                    setHoveredNav(item.id);
                  }
                }} 
                onMouseLeave={() => {
                  if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                    setHoveredNav(null);
                  }
                }} 
                className="relative"
              >
                {item.href ? (
                  <Link 
                    href={item.href} 
                    onClick={() => {
                      setSidebarOpen(false);
                      setHoveredNav(null);
                    }} 
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left group relative ${isActive ? "bg-[oklch(0.55_0.2_170/0.12)] text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: "oklch(0.55 0.2 170)" }} />}
                    <Icon className="w-4 h-4 shrink-0" style={isActive ? { color: "oklch(0.55 0.2 170)" } : {}} />
                    <span className="flex-1 font-medium">{item.label}</span>
                  </Link>
                ) : (
                  <div 
                    onClick={() => setHoveredNav(hoveredNav === item.id ? null : item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left cursor-pointer ${isActive ? "bg-[oklch(0.55_0.2_170/0.12)] text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: "oklch(0.55 0.2 170)" }} />}
                    <Icon className="w-4 h-4 shrink-0" style={isActive ? { color: "oklch(0.55 0.2 170)" } : {}} />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full text-black" style={{ background: "oklch(0.55 0.2 170)" }}>{item.badge}</span>}
                  </div>
                )}

                {item.subItems && hoveredNav === item.id && (
                  <div className="absolute top-full left-0 w-full pt-1 z-10">
                    <div className="bg-[#111] border border-white/10 rounded-lg p-2 shadow-xl ml-4 flex flex-col gap-1">
                      {item.subItems.map((sub) => (
                        <Link 
                          key={sub.href} 
                          href={sub.href} 
                          onClick={() => {
                            setSidebarOpen(false);
                            setHoveredNav(null); 
                          }} 
                          className="px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            {user?.profile_img ? (
              <img 
                src={user.profile_img} 
                alt="Profile" 
                className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/10"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-black shrink-0" style={{ background: "oklch(0.55 0.2 170)" }}>
                {user?.display_name?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white font-medium truncate">{userLoading ? "Loading..." : user?.display_name || "Admin"}</p>
              <p className="text-[10px] text-white/40 truncate">{userLoading ? "..." : user?.email || "admin@technify.dev"}</p>
            </div>
            <button onClick={handleLogoutClick} className="text-white/30 hover:text-red-400 transition-colors shrink-0" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a]">
          <span className="text-lg font-semibold text-white tracking-tight" style={{ fontFamily: "var(--font-fredericka)" }}>TechNify</span>
          <button onClick={() => setSidebarOpen(true)} className="text-white/70 hover:text-white p-1">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none opacity-30" style={{ background: "radial-gradient(circle, oklch(0.55 0.2 170 / 0.06) 0%, transparent 70%)" }} />
          
          {(userLoading || dashboardLoading) && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300">
              <Loader2 className="w-8 h-8 animate-spin mb-3 shadow-lg" style={{ color: "oklch(0.55 0.2 170)" }} />
              <p className="text-[10px] font-mono text-white/50 tracking-widest uppercase animate-pulse">
                Syncing Data...
              </p>
            </div>
          )}

          <div className="relative z-10 max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <DashboardProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </DashboardProvider>
    </UserProvider>
  );
}
