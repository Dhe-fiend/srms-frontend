"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { StatCard } from "@/components/ui/StatCard";

interface DashboardStats {
  widgets: {
    totalStudents: number;
    activeStudents: number;
    suspendedStudents: number;
    graduatedStudents: number;
    totalStaff: number;
    totalDepartments: number;
    totalFaculties: number;
    currentSession: string | null;
    currentSemester: string | null;
    revenue: number;
    outstandingFees: number;
  };
  charts: {
    studentPopulationByFaculty: { faculty: string; students: number }[];
    genderDistribution: { gender: string; count: number }[];
  };
}

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => api.get<DashboardStats>("/admin/dashboard/stats"),
  });

  if (isLoading) return <div className="text-text-muted font-mono text-sm">Loading dashboard…</div>;
  if (error || !data) return <div className="text-danger text-sm">Could not load dashboard stats.</div>;

  const { widgets, charts } = data;
  const maxFacultyStudents = Math.max(...charts.studentPopulationByFaculty.map((f) => f.students), 1);
  const totalGender = charts.genderDistribution.reduce((sum, g) => sum + g.count, 0) || 1;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Dashboard</h1>
        <p className="text-text-muted text-sm">
          {widgets.currentSession} · {widgets.currentSemester}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Students" value={widgets.totalStudents} accent="cyan" />
        <StatCard label="Active" value={widgets.activeStudents} accent="cyan" />
        <StatCard label="Suspended" value={widgets.suspendedStudents} accent="violet" />
        <StatCard label="Graduated" value={widgets.graduatedStudents} accent="violet" />
        <StatCard label="Staff" value={widgets.totalStaff} accent="cyan" />
        <StatCard label="Departments" value={widgets.totalDepartments} accent="cyan" />
        <StatCard label="Faculties" value={widgets.totalFaculties} accent="violet" />
        <StatCard label="Outstanding Fees" value={`₦${widgets.outstandingFees.toLocaleString()}`} accent="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-6">
          <h2 className="font-display text-sm font-semibold text-text-primary mb-4">
            Student Population by Faculty
          </h2>
          <div className="space-y-3">
            {charts.studentPopulationByFaculty.map((f) => (
              <div key={f.faculty}>
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>{f.faculty}</span>
                  <span className="font-mono">{f.students}</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cta-gradient rounded-full"
                    style={{ width: `${(f.students / maxFacultyStudents) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display text-sm font-semibold text-text-primary mb-4">Gender Distribution</h2>
          <div className="space-y-3">
            {charts.genderDistribution.map((g) => (
              <div key={g.gender}>
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>{g.gender}</span>
                  <span className="font-mono">
                    {g.count} ({Math.round((g.count / totalGender) * 100)}%)
                  </span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${g.gender === "MALE" ? "bg-accent-cyan" : "bg-accent-violet"}`}
                    style={{ width: `${(g.count / totalGender) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
