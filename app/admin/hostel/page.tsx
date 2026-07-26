"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { Plus, X } from "lucide-react";

interface Hostel {
  id: string;
  name: string;
  capacity: number;
  _count: { allocations: number };
}

interface Allocation {
  studentId: string;
  roomNo: string;
  allocatedAt: string;
  student: { firstName: string; lastName: string; matricNumber: string };
  hostel: { name: string };
}

export default function HostelPage() {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [hostelId, setHostelId] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: hostels } = useQuery({ queryKey: ["hostels"], queryFn: () => api.get<Hostel[]>("/admin/hostel/hostels") });
  const { data: allocations } = useQuery({ queryKey: ["hostel-allocations"], queryFn: () => api.get<Allocation[]>("/admin/hostel/allocations") });

  const { data: studentResults } = useQuery({
    queryKey: ["student-search-hostel", studentSearch],
    queryFn: () => api.get<{ data: { id: string; firstName: string; lastName: string; matricNumber: string }[] }>(
      `/admin/students?search=${encodeURIComponent(studentSearch)}&pageSize=5`
    ),
    enabled: studentSearch.length > 1,
  });

  const createHostelMutation = useMutation({
    mutationFn: () => api.post("/admin/hostel/hostels", { name, capacity: Number(capacity) }),
    onSuccess: () => {
      setName("");
      setCapacity("");
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
    },
  });

  const allocateMutation = useMutation({
    mutationFn: () => api.post("/admin/hostel/allocations", { studentId, hostelId, roomNo }),
    onSuccess: () => {
      setMessage({ type: "success", text: "Room allocated." });
      setStudentId("");
      setStudentSearch("");
      setRoomNo("");
      queryClient.invalidateQueries({ queryKey: ["hostel-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
    },
    onError: (err) => setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Allocation failed." }),
  });

  const deallocateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/hostel/allocations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostel-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Hostel Management</h1>
      <p className="text-text-muted text-sm mb-6">Manage hostels and room allocations.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {(hostels ?? []).map((h) => (
          <div key={h.id} className="glass-panel p-5">
            <p className="text-text-primary font-medium">{h.name}</p>
            <p className="text-text-muted text-sm mt-1">
              {h._count.allocations} / {h.capacity} occupied
            </p>
            <div className="h-1.5 bg-surface rounded-full overflow-hidden mt-2">
              <div className="h-full bg-cta-gradient rounded-full" style={{ width: `${Math.min((h._count.allocations / h.capacity) * 100, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createHostelMutation.mutate();
        }}
        className="glass-panel p-5 mb-6 flex items-end gap-3"
      >
        <div className="flex-1">
          <label className="block text-xs text-text-muted mb-1.5">New Hostel Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="input-field" placeholder="e.g. Unity Hall" />
        </div>
        <div className="w-32">
          <label className="block text-xs text-text-muted mb-1.5">Capacity</label>
          <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} required className="input-field" />
        </div>
        <button type="submit" disabled={createHostelMutation.isPending} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Hostel
        </button>
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          allocateMutation.mutate();
        }}
        className="glass-panel p-5 mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 items-end relative"
      >
        <div className="relative">
          <label className="block text-xs text-text-muted mb-1.5">Student</label>
          <input
            value={studentSearch}
            onChange={(e) => {
              setStudentSearch(e.target.value);
              setStudentId("");
            }}
            placeholder="Search name or matric…"
            required
            className="input-field"
          />
          {studentResults && studentResults.data.length > 0 && !studentId && (
            <div className="absolute z-10 mt-1 w-full glass-panel max-h-48 overflow-y-auto">
              {studentResults.data.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => {
                    setStudentId(s.id);
                    setStudentSearch(`${s.firstName} ${s.lastName}`);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-surfaceHover/60 transition-colors"
                >
                  {s.firstName} {s.lastName} <span className="font-mono text-accent-cyan text-xs">{s.matricNumber}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Hostel</label>
          <select value={hostelId} onChange={(e) => setHostelId(e.target.value)} required className="input-field">
            <option value="">Select…</option>
            {(hostels ?? []).map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Room No.</label>
          <input value={roomNo} onChange={(e) => setRoomNo(e.target.value)} required className="input-field" placeholder="e.g. B12" />
        </div>
        <button type="submit" disabled={!studentId || allocateMutation.isPending} className="btn-primary">
          Allocate
        </button>

        {message && (
          <div
            className={`col-span-full text-sm rounded-lg px-4 py-3 border ${
              message.type === "success" ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan" : "bg-danger/10 border-danger/30 text-danger"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>

      <div className="glass-panel divide-y divide-border">
        {(allocations ?? []).map((a) => (
          <div key={a.studentId} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-text-primary">{a.student.firstName} {a.student.lastName}</p>
              <p className="text-xs text-text-muted">
                <span className="font-mono text-accent-cyan">{a.student.matricNumber}</span> · {a.hostel.name} · Room {a.roomNo}
              </p>
            </div>
            <button
              onClick={() => deallocateMutation.mutate(a.studentId)}
              className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
              title="Deallocate"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
