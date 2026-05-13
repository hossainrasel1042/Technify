"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Project = {
  id: string;
  title: string;
  client_name: string;
  project_url: string;
  status: string;
  description: string;
  company_logo: string;
  created_at: string;
};

export type Review = {
  id: string;
  client_name: string;
  role_company: string;
  rating: number;
  review_text: string;
  created_at: string;
};

type DashboardContextType = {
  projects: Project[];
  reviews: Review[];
  loading: boolean;
  refreshData: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/project"); // Adjust path if your route is different
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProjects(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch projects:", e);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/review"); // Adjust path if your route is different
      const json = await res.json();
      // Note: Your review GET route returns the array directly, not { success: true, data }
      if (Array.isArray(json)) {
        setReviews(json);
      } else if (json.success && Array.isArray(json.data)) {
        setReviews(json.data); // Fallback in case the API format changes
      }
    } catch (e) {
      console.error("Failed to fetch reviews:", e);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchProjects(), fetchReviews()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DashboardContext.Provider value={{ projects, reviews, loading, refreshData }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
