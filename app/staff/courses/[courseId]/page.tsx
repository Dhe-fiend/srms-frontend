"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";

interface RosterEntry {
  student: { id: string; firstName: string; lastName: string; matricNumber: string };
  result: { caScore: number; examScore: number; totalScore: number; grade: string | null; status: string } | null;
}

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-text-faint/10 text-text-faint border-text-faint/30",
  SUBMITTED: "bg-warn/10 text-warn border-warn/30",
  APPROVED: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
};

export default function CourseRosterPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [scores, setScores] = useState<Record<string, { ca: string; exam: string }>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["course-roster", courseId],
    queryFn: () => api.get<RosterEntry[]>(`/lecturers/courses/${courseId}/roster`),
  });

  const submitMutation = useMutation({
    mutationFn: (params: { studentId: string; caScore: number; examScore: number }) =>
      api.post("/lecturers/results", { studentId: params.studentId, courseId, caScore: params.caScore, examScore: params.examScore }),
    onSuccess: () => {
      setMessage({ type: "success", text: "Result submitted for HOD approval." });
      queryClient.invalidateQueries({ queryKey: ["course-roster", courseId] });
    },
    onError: (err) => {
      setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Submission failed." });
    },
  });

  function updateScore(studentId: string, field: "ca" | "exam", value: string) {
    setScores((prev) => ({ ...prev, [studentId]: { ca: prev[studentId]?.ca ?? "", exam: prev[studentId]?.exam ?? "", [field]: value } }));
  }

  function submit(studentId: string) {
    const entry = scores[studentId];
    if (!entry) return;
    submitMutation.mutate({ studentId, caScore: Number(entry.ca), examScore: Number(entry.exam) });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Class Roster</h1>
      <p className="text-text-muted text-sm mb-6">Enter CA (0–30) and Exam (0–70) scores, then submit for HOD approval.</p>

      {message && (
        <div
          className={`mb-4 text-sm rounded-lg px-4 py-3 border ${
            message.type === "success"
              ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan"
              : "bg-danger/10 border-danger/30 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="text-text-muted font-mono text-sm">Loading roster…</div>
      ) : !data || data.length === 0 ? (
        <div className="glass-panel p-8 text-center text-text-muted text-sm">No students registered for this course yet.</div>
      ) : (
        <div className="glass-panel divide-y divide-border">
          {data.map(({ student, result }) => {
            const draft = scores[student.id];
            const locked = result?.status === "SUBMITTED" || result?.status === "APPROVED";
            return (
              <div key={student.id} className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="min-w-0">
                  <p className="text-text-primary truncate">{student.firstName} {student.lastName}</p>
                  <p className="font-mono text-xs text-accent-cyan">{student.matricNumber}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {result && (
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${STATUS_STYLE[result.status]}`}>
                      {result.status}
                    </span>
                  )}
                  <input
                    type="number"
                    min={0}
                    max={30}
                    placeholder="CA"
                    disabled={locked}
                    defaultValue={result?.caScore}
                    onChange={(e) => updateScore(student.id, "ca", e.target.value)}
                    className="input-field w-16 text-center disabled:opacity-50"
                  />
                  <input
                    type="number"
                    min={0}
                    max={70}
                    placeholder="Exam"
                    disabled={locked}
                    defaultValue={result?.examScore}
                    onChange={(e) => updateScore(student.id, "exam", e.target.value)}
                    className="input-field w-16 text-center disabled:opacity-50"
                  />
                  <button
                    disabled={locked || !draft?.ca || !draft?.exam || submitMutation.isPending}
                    onClick={() => submit(student.id)}
                    className="btn-primary text-xs px-3 py-2"
                  >
                    Submit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
