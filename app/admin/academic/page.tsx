"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { Plus } from "lucide-react";

interface Faculty {
  id: string;
  name: string;
  code: string;
  _count: { departments: number };
}

interface Department {
  id: string;
  name: string;
  code: string;
  maxLevel: number;
  hodId: string | null;
  faculty: { name: string };
  _count: { students: number; courses: number };
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  departmentId: string | null;
  user: { roles: { role: { name: string } }[] };
}

interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  level: number;
  semester: number;
  department: { name: string };
}

type Tab = "faculties" | "departments" | "courses";

export default function AcademicStructurePage() {
  const [tab, setTab] = useState<Tab>("faculties");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Academic Structure</h1>
      <p className="text-text-muted text-sm mb-6">Manage faculties, departments, and courses.</p>

      <div className="flex gap-2 mb-6 border-b border-border">
        {(["faculties", "departments", "courses"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm capitalize border-b-2 transition-colors ${
              tab === t ? "border-accent-violet text-accent-violet" : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "faculties" && <FacultiesTab />}
      {tab === "departments" && <DepartmentsTab />}
      {tab === "courses" && <CoursesTab />}
    </div>
  );
}

function ErrorBanner({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <div className="mb-4 text-sm rounded-lg px-4 py-3 border bg-danger/10 border-danger/30 text-danger">
      {error instanceof ApiError ? error.message : "Something went wrong."}
    </div>
  );
}

function FacultiesTab() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-faculties"],
    queryFn: () => api.get<Faculty[]>("/admin/academic/faculties"),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/admin/academic/faculties", { name, code }),
    onSuccess: () => {
      setName("");
      setCode("");
      queryClient.invalidateQueries({ queryKey: ["admin-faculties"] });
    },
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
        className="glass-panel p-5 mb-6 flex items-end gap-3"
      >
        <div className="flex-1">
          <label className="block text-xs text-text-muted mb-1.5">Faculty Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="input-field" placeholder="e.g. Environmental Sciences" />
        </div>
        <div className="w-32">
          <label className="block text-xs text-text-muted mb-1.5">Code</label>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required maxLength={10} className="input-field" placeholder="ENV" />
        </div>
        <button type="submit" disabled={createMutation.isPending} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add
        </button>
      </form>

      <ErrorBanner error={createMutation.error} />

      {isLoading ? (
        <div className="text-text-muted font-mono text-sm">Loading…</div>
      ) : (
        <div className="glass-panel divide-y divide-border">
          {(data ?? []).map((f) => (
            <div key={f.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-text-primary">{f.name}</p>
                <p className="font-mono text-xs text-accent-violet">{f.code}</p>
              </div>
              <span className="text-text-muted text-sm">{f._count.departments} departments</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DepartmentsTab() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [maxLevel, setMaxLevel] = useState(400);
  const queryClient = useQueryClient();

  const { data: faculties } = useQuery({
    queryKey: ["admin-faculties"],
    queryFn: () => api.get<Faculty[]>("/admin/academic/faculties"),
  });

  const { data: departments, isLoading } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: () => api.get<Department[]>("/admin/academic/departments"),
  });

  const { data: staff } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: () => api.get<StaffMember[]>("/admin/staff"),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/admin/academic/departments", { name, code, facultyId, maxLevel }),
    onSuccess: () => {
      setName("");
      setCode("");
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] });
    },
  });

  const assignHodMutation = useMutation({
    mutationFn: (params: { departmentId: string; staffId: string }) =>
      api.patch(`/admin/academic/departments/${params.departmentId}/hod`, { staffId: params.staffId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-departments"] }),
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
        className="glass-panel p-5 mb-6 grid grid-cols-2 lg:grid-cols-5 gap-3 items-end"
      >
        <div className="col-span-2">
          <label className="block text-xs text-text-muted mb-1.5">Department Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Code</label>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required maxLength={10} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Faculty</label>
          <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} required className="input-field">
            <option value="">Select…</option>
            {(faculties ?? []).map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-text-muted mb-1.5">Max Level</label>
            <input type="number" step={100} value={maxLevel} onChange={(e) => setMaxLevel(Number(e.target.value))} className="input-field" />
          </div>
          <button type="submit" disabled={createMutation.isPending} className="btn-primary px-3">
            <Plus size={16} />
          </button>
        </div>
      </form>

      <ErrorBanner error={createMutation.error} />

      {isLoading ? (
        <div className="text-text-muted font-mono text-sm">Loading…</div>
      ) : (
        <div className="glass-panel divide-y divide-border">
          {(departments ?? []).map((d) => {
            const deptStaff = (staff ?? []).filter((s) => s.departmentId === d.id);
            return (
              <div key={d.id} className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="min-w-0">
                  <p className="text-text-primary">{d.name}</p>
                  <p className="text-xs text-text-muted">
                    <span className="font-mono text-accent-violet">{d.code}</span> · {d.faculty.name} · Max Level {d.maxLevel}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{d._count.students} students · {d._count.courses} courses</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {d.hodId ? (
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full border bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30">
                      HOD assigned
                    </span>
                  ) : (
                    <>
                      <select
                        className="input-field text-xs py-1.5 w-40"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) assignHodMutation.mutate({ departmentId: d.id, staffId: e.target.value });
                        }}
                      >
                        <option value="">Assign HOD…</option>
                        {deptStaff.map((s) => (
                          <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CoursesTab() {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [units, setUnits] = useState(3);
  const [level, setLevel] = useState(100);
  const [semester, setSemester] = useState(1);
  const [departmentId, setDepartmentId] = useState("");
  const queryClient = useQueryClient();

  const { data: departments } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: () => api.get<Department[]>("/admin/academic/departments"),
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => api.get<Course[]>("/admin/academic/courses"),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/admin/academic/courses", { code, title, units, level, semester, departmentId }),
    onSuccess: () => {
      setCode("");
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
        className="glass-panel p-5 mb-6 grid grid-cols-2 lg:grid-cols-6 gap-3 items-end"
      >
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Code</label>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required className="input-field" placeholder="CSC301" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-text-muted mb-1.5">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Units</label>
          <input type="number" min={1} max={6} value={units} onChange={(e) => setUnits(Number(e.target.value))} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Level</label>
          <select value={level} onChange={(e) => setLevel(Number(e.target.value))} className="input-field">
            {[100, 200, 300, 400, 500].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Semester</label>
          <select value={semester} onChange={(e) => setSemester(Number(e.target.value))} className="input-field">
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-text-muted mb-1.5">Department</label>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required className="input-field">
            <option value="">Select…</option>
            {(departments ?? []).map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={createMutation.isPending} className="btn-primary flex items-center gap-2 justify-center">
          <Plus size={16} />
          Add Course
        </button>
      </form>

      <ErrorBanner error={createMutation.error} />

      {isLoading ? (
        <div className="text-text-muted font-mono text-sm">Loading…</div>
      ) : (
        <div className="glass-panel divide-y divide-border">
          {(courses ?? []).map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-mono text-xs text-accent-violet">{c.code}</p>
                <p className="text-text-primary">{c.title}</p>
                <p className="text-xs text-text-muted">{c.department.name} · Level {c.level} · Semester {c.semester}</p>
              </div>
              <span className="text-text-muted text-sm">{c.units} units</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
