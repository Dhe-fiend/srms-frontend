"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ChevronRight } from "lucide-react";

interface CourseAssignment {
  course: { id: string; code: string; title: string; units: number; level: number };
}

export default function StaffCoursesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-lecturer-courses"],
    queryFn: () => api.get<CourseAssignment[]>("/lecturers/me/courses"),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">My Courses</h1>
      <p className="text-text-muted text-sm mb-6">Select a course to view the class roster and enter results.</p>

      {isLoading ? (
        <div className="text-text-muted font-mono text-sm">Loading…</div>
      ) : !data || data.length === 0 ? (
        <div className="glass-panel p-8 text-center text-text-muted text-sm">
          No courses assigned to you yet. Contact an administrator.
        </div>
      ) : (
        <div className="glass-panel divide-y divide-border">
          {data.map(({ course }) => (
            <Link
              key={course.id}
              href={`/staff/courses/${course.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-surfaceHover/50 transition-colors"
            >
              <div>
                <p className="font-mono text-xs text-accent-cyan">{course.code}</p>
                <p className="text-text-primary">{course.title}</p>
                <p className="text-xs text-text-muted">Level {course.level} · {course.units} units</p>
              </div>
              <ChevronRight size={18} className="text-text-faint" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
