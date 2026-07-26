"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { StatCard } from "@/components/ui/StatCard";

interface StudentProfile {
  firstName: string;
  lastName: string;
  matricNumber: string;
  level: number;
  cgpa: number;
  status: string;
  department: { name: string; faculty: { name: string } };
  programme: { name: string };
}

export default function DashboardOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => api.get<StudentProfile>("/students/me"),
  });

  if (isLoading) return <div className="text-text-muted font-mono text-sm">Loading profile…</div>;
  if (error || !data) return <div className="text-danger text-sm">Could not load profile.</div>;

  return (
    <div>
      <div className="mb-8">
        <p className="id-badge mb-3">{data.matricNumber}</p>
        <h1 className="font-display text-3xl font-semibold text-text-primary">
          {data.firstName} {data.lastName}
        </h1>
        <p className="text-text-muted mt-1">
          {data.programme.name} · {data.department.faculty.name}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Level" value={data.level} accent="cyan" />
        <StatCard label="CGPA" value={data.cgpa.toFixed(2)} accent="violet" />
        <StatCard label="Status" value={data.status} accent="cyan" />
        <StatCard label="Department" value={data.department.name} accent="violet" />
      </div>
    </div>
  );
}
