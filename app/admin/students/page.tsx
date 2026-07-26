"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { Search, ShieldOff, ShieldCheck, ArrowUpCircle, GraduationCap } from "lucide-react";

interface Student {
  id: string;
  matricNumber: string;
  firstName: string;
  lastName: string;
  level: number;
  status: "ACTIVE" | "SUSPENDED" | "GRADUATED" | "WITHDRAWN" | "DEFERRED";
  department: { name: string };
}

interface StudentListResponse {
  data: Student[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

const STATUS_STYLE: Record<Student["status"], string> = {
  ACTIVE: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
  SUSPENDED: "bg-danger/10 text-danger border-danger/30",
  GRADUATED: "bg-accent-violet/10 text-accent-violet border-accent-violet/30",
  WITHDRAWN: "bg-text-faint/10 text-text-faint border-text-faint/30",
  DEFERRED: "bg-warn/10 text-warn border-warn/30",
};

export default function AdminStudentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-students", search, page],
    queryFn: () =>
      api.get<StudentListResponse>(`/admin/students?page=${page}&pageSize=20${search ? `&search=${encodeURIComponent(search)}` : ""}`),
  });

  function useStudentAction(action: "suspend" | "restore" | "promote" | "graduate") {
    return useMutation({
      mutationFn: (studentId: string) => api.patch(`/admin/students/${studentId}/${action}`),
      onSuccess: () => {
        setActionMessage({ type: "success", text: `Student ${action}d successfully.` });
        queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      },
      onError: (err) => {
        setActionMessage({ type: "error", text: err instanceof ApiError ? err.message : `Failed to ${action} student.` });
      },
    });
  }

  const suspendMutation = useStudentAction("suspend");
  const restoreMutation = useStudentAction("restore");
  const promoteMutation = useStudentAction("promote");
  const graduateMutation = useStudentAction("graduate");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Student Records</h1>
          <p className="text-text-muted text-sm">
            {data?.pagination.total ?? "…"} students total
          </p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name or matric number…"
            className="input-field pl-9 w-72"
          />
        </div>
      </div>

      {actionMessage && (
        <div
          className={`mb-4 text-sm rounded-lg px-4 py-3 border ${
            actionMessage.type === "success"
              ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan"
              : "bg-danger/10 border-danger/30 text-danger"
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {isLoading ? (
        <div className="text-text-muted font-mono text-sm">Loading students…</div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-5 py-3">Department</th>
                <th className="text-left px-5 py-3">Level</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data?.data ?? []).map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-4">
                    <p className="text-text-primary">{s.firstName} {s.lastName}</p>
                    <p className="font-mono text-xs text-accent-cyan">{s.matricNumber}</p>
                  </td>
                  <td className="px-5 py-4 text-text-muted">{s.department.name}</td>
                  <td className="px-5 py-4 text-text-muted">{s.level}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${STATUS_STYLE[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {s.status === "ACTIVE" && (
                        <>
                          <button
                            title="Suspend"
                            onClick={() => suspendMutation.mutate(s.id)}
                            className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                          >
                            <ShieldOff size={16} />
                          </button>
                          <button
                            title="Promote"
                            onClick={() => promoteMutation.mutate(s.id)}
                            className="p-1.5 rounded-lg hover:bg-accent-cyan/10 text-text-muted hover:text-accent-cyan transition-colors"
                          >
                            <ArrowUpCircle size={16} />
                          </button>
                          <button
                            title="Graduate"
                            onClick={() => graduateMutation.mutate(s.id)}
                            className="p-1.5 rounded-lg hover:bg-accent-violet/10 text-text-muted hover:text-accent-violet transition-colors"
                          >
                            <GraduationCap size={16} />
                          </button>
                        </>
                      )}
                      {s.status === "SUSPENDED" && (
                        <button
                          title="Restore"
                          onClick={() => restoreMutation.mutate(s.id)}
                          className="p-1.5 rounded-lg hover:bg-accent-cyan/10 text-text-muted hover:text-accent-cyan transition-colors"
                        >
                          <ShieldCheck size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-text-muted">
          <span>
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
