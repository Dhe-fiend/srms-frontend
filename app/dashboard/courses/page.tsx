"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { CheckCircle2, XCircle } from "lucide-react";

interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  prerequisitesMet: boolean;
}

export default function CoursesPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["available-courses"],
    queryFn: () => api.get<Course[]>("/students/me/courses/available"),
  });

  const registerMutation = useMutation({
    mutationFn: () => api.post<{ warning: string | null }>("/students/me/courses/register", { courseIds: Array.from(selected) }),
    onSuccess: (result) => {
      setMessage({
        type: result.warning ? "error" : "success",
        text: result.warning ?? "Courses registered successfully.",
      });
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["available-courses"] });
    },
    onError: (err) => {
      setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Registration failed." });
    },
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const totalUnits = (courses ?? []).filter((c) => selected.has(c.id)).reduce((sum, c) => sum + c.units, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Course Registration</h1>
      <p className="text-text-muted text-sm mb-6">Select courses available for your current level.</p>

      {message && (
        <div
          className={`mb-4 text-sm rounded-lg px-4 py-3 border ${
            message.type === "success"
              ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan"
              : "bg-warn/10 border-warn/30 text-warn"
          }`}
        >
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="text-text-muted font-mono text-sm">Loading courses…</div>
      ) : (
        <div className="glass-panel divide-y divide-border">
          {(courses ?? []).map((course) => (
            <label
              key={course.id}
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surfaceHover/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selected.has(course.id)}
                  onChange={() => toggle(course.id)}
                  disabled={!course.prerequisitesMet}
                  className="w-4 h-4 accent-accent-cyan"
                />
                <div>
                  <p className="font-mono text-sm text-accent-cyan">{course.code}</p>
                  <p className="text-text-primary text-sm">{course.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-text-muted text-sm">{course.units} units</span>
                {course.prerequisitesMet ? (
                  <CheckCircle2 size={16} className="text-accent-cyan" />
                ) : (
                  <XCircle size={16} className="text-danger" />
                )}
              </div>
            </label>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-text-muted text-sm">
          Selected: <span className="text-text-primary font-mono">{selected.size}</span> courses ·{" "}
          <span className="text-text-primary font-mono">{totalUnits}</span> units
        </p>
        <button
          className="btn-primary"
          disabled={selected.size === 0 || registerMutation.isPending}
          onClick={() => registerMutation.mutate()}
        >
          {registerMutation.isPending ? "Registering…" : "Register Selected"}
        </button>
      </div>
    </div>
  );
}
