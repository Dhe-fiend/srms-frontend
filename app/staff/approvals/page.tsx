"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { Check, X } from "lucide-react";

interface PendingResult {
  id: string;
  totalScore: number;
  grade: string;
  student: { firstName: string; lastName: string; matricNumber: string };
  course: { code: string; title: string; units: number };
}

export default function ApprovalsPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: () => api.get<PendingResult[]>("/lecturers/results/pending"),
  });

  const approveMutation = useMutation({
    mutationFn: (resultId: string) => api.patch(`/lecturers/results/${resultId}/approve`),
    onSuccess: () => {
      setMessage({ type: "success", text: "Result approved. Student CGPA recalculated." });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
    },
    onError: (err) => setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Failed to approve." }),
  });

  const rejectMutation = useMutation({
    mutationFn: (resultId: string) => api.patch(`/lecturers/results/${resultId}/reject`, { reason: "Sent back for review" }),
    onSuccess: () => {
      setMessage({ type: "success", text: "Result sent back to lecturer." });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
    },
    onError: (err) => setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Failed to reject." }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Pending Approvals</h1>
      <p className="text-text-muted text-sm mb-6">Results submitted by lecturers in your department, awaiting your sign-off.</p>

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
        <div className="text-text-muted font-mono text-sm">Loading…</div>
      ) : !data || data.length === 0 ? (
        <div className="glass-panel p-8 text-center text-text-muted text-sm">Nothing pending approval right now.</div>
      ) : (
        <div className="glass-panel divide-y divide-border">
          {data.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-text-primary">{r.student.firstName} {r.student.lastName}</p>
                <p className="text-xs text-text-muted">
                  <span className="font-mono text-accent-cyan">{r.student.matricNumber}</span> · {r.course.code} · Score {r.totalScore} · Grade {r.grade}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => approveMutation.mutate(r.id)}
                  disabled={approveMutation.isPending}
                  className="p-2 rounded-lg hover:bg-accent-cyan/10 text-text-muted hover:text-accent-cyan transition-colors"
                  title="Approve"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => rejectMutation.mutate(r.id)}
                  disabled={rejectMutation.isPending}
                  className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                  title="Send back"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
