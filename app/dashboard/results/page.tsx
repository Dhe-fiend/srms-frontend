"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface ResultRow {
  id: string;
  course: { code: string; title: string; units: number };
  semester: { session: { name: string }; number: number };
  totalScore: number;
  grade: string;
  gradePoint: number;
}

const GRADE_COLOR: Record<string, string> = {
  A: "text-accent-cyan",
  B: "text-accent-cyan",
  C: "text-warn",
  D: "text-warn",
  E: "text-warn",
  F: "text-danger",
};

export default function ResultsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-results"],
    queryFn: () => api.get<ResultRow[]>("/students/me/results"),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Results</h1>
      <p className="text-text-muted text-sm mb-6">Approved results only.</p>

      {isLoading ? (
        <div className="text-text-muted font-mono text-sm">Loading results…</div>
      ) : !data || data.length === 0 ? (
        <div className="glass-panel p-8 text-center text-text-muted text-sm">
          No approved results yet. Results appear here once your lecturer submits them and your HOD approves them.
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Course</th>
                <th className="text-left px-5 py-3">Session</th>
                <th className="text-right px-5 py-3">Score</th>
                <th className="text-right px-5 py-3">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-4">
                    <p className="font-mono text-accent-cyan text-xs">{r.course.code}</p>
                    <p className="text-text-primary">{r.course.title}</p>
                  </td>
                  <td className="px-5 py-4 text-text-muted">
                    {r.semester.session.name} · S{r.semester.number}
                  </td>
                  <td className="px-5 py-4 text-right text-text-primary font-mono">{r.totalScore}</td>
                  <td className={`px-5 py-4 text-right font-display font-semibold ${GRADE_COLOR[r.grade] ?? ""}`}>
                    {r.grade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
