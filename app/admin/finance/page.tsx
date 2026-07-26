"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { StatCard } from "@/components/ui/StatCard";
import { Plus, Users } from "lucide-react";

interface FinanceReport {
  totalRevenue: number;
  totalInvoiced: number;
  totalOutstanding: number;
  invoiceStatusCounts: { status: string; count: number }[];
  recentPayments: { reference: string; amount: number; paidAt: string; student: { firstName: string; lastName: string; matricNumber: string } }[];
}

interface Invoice {
  id: string;
  type: string;
  amount: number;
  amountPaid: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
  dueDate: string;
  student: { firstName: string; lastName: string; matricNumber: string };
}

interface Department {
  id: string;
  name: string;
}

const STATUS_STYLE: Record<string, string> = {
  UNPAID: "bg-danger/10 text-danger border-danger/30",
  PARTIAL: "bg-warn/10 text-warn border-warn/30",
  PAID: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
};

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function FinancePage() {
  const [mode, setMode] = useState<"single" | "bulk">("bulk");

  const { data: report } = useQuery({
    queryKey: ["finance-report"],
    queryFn: () => api.get<FinanceReport>("/admin/finance/report"),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Finance</h1>
      <p className="text-text-muted text-sm mb-6">Invoice generation and payment reports.</p>

      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Revenue" value={naira(report.totalRevenue)} accent="cyan" />
          <StatCard label="Total Invoiced" value={naira(report.totalInvoiced)} accent="violet" />
          <StatCard label="Outstanding" value={naira(report.totalOutstanding)} accent="violet" />
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("bulk")}
          className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
            mode === "bulk" ? "border-accent-violet/40 bg-accent-violet/10 text-accent-violet" : "border-border text-text-muted"
          }`}
        >
          Bulk Generate
        </button>
        <button
          onClick={() => setMode("single")}
          className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
            mode === "single" ? "border-accent-violet/40 bg-accent-violet/10 text-accent-violet" : "border-border text-text-muted"
          }`}
        >
          Single Invoice
        </button>
      </div>

      {mode === "bulk" ? <BulkInvoiceForm /> : <SingleInvoiceForm />}

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-text-primary mb-4">Invoices</h2>
        <InvoiceList />
      </div>
    </div>
  );
}

function BulkInvoiceForm() {
  const [type, setType] = useState<"SCHOOL_FEES" | "ACCEPTANCE_FEES" | "HOSTEL_FEES">("SCHOOL_FEES");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [level, setLevel] = useState("");
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: departments } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: () => api.get<Department[]>("/admin/academic/departments"),
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.post<{ count: number }>("/admin/finance/invoices/bulk", {
        type,
        amount: Number(amount),
        dueDate,
        departmentId: departmentId || undefined,
        level: level ? Number(level) : undefined,
      }),
    onSuccess: (res) => {
      setResult({ type: "success", text: `Generated ${res.count} invoice(s).` });
      queryClient.invalidateQueries({ queryKey: ["finance-report"] });
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
    },
    onError: (err) => setResult({ type: "error", text: err instanceof ApiError ? err.message : "Failed to generate invoices." }),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="glass-panel p-5 grid grid-cols-2 lg:grid-cols-6 gap-3 items-end"
    >
      <div>
        <label className="block text-xs text-text-muted mb-1.5">Fee Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="input-field">
          <option value="SCHOOL_FEES">School Fees</option>
          <option value="ACCEPTANCE_FEES">Acceptance Fees</option>
          <option value="HOSTEL_FEES">Hostel Fees</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1.5">Amount (₦)</label>
        <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} required className="input-field" />
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1.5">Due Date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="input-field" />
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1.5">Department (optional)</label>
        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="input-field">
          <option value="">All departments</option>
          {(departments ?? []).map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1.5">Level (optional)</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-field">
          <option value="">All levels</option>
          {[100, 200, 300, 400, 500].map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <button type="submit" disabled={mutation.isPending} className="btn-primary flex items-center gap-2 justify-center">
        <Users size={16} />
        Generate
      </button>

      {result && (
        <div
          className={`col-span-full text-sm rounded-lg px-4 py-3 border ${
            result.type === "success" ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan" : "bg-danger/10 border-danger/30 text-danger"
          }`}
        >
          {result.text}
        </div>
      )}
    </form>
  );
}

function SingleInvoiceForm() {
  const [studentSearch, setStudentSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState<"SCHOOL_FEES" | "ACCEPTANCE_FEES" | "HOSTEL_FEES">("SCHOOL_FEES");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: studentResults } = useQuery({
    queryKey: ["student-search-finance", studentSearch],
    queryFn: () => api.get<{ data: { id: string; firstName: string; lastName: string; matricNumber: string }[] }>(
      `/admin/students?search=${encodeURIComponent(studentSearch)}&pageSize=5`
    ),
    enabled: studentSearch.length > 1,
  });

  const mutation = useMutation({
    mutationFn: () => api.post("/admin/finance/invoices", { studentId, type, amount: Number(amount), dueDate }),
    onSuccess: () => {
      setResult({ type: "success", text: "Invoice created." });
      queryClient.invalidateQueries({ queryKey: ["finance-report"] });
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
    },
    onError: (err) => setResult({ type: "error", text: err instanceof ApiError ? err.message : "Failed to create invoice." }),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="glass-panel p-5 grid grid-cols-2 lg:grid-cols-5 gap-3 items-end"
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
        <label className="block text-xs text-text-muted mb-1.5">Fee Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="input-field">
          <option value="SCHOOL_FEES">School Fees</option>
          <option value="ACCEPTANCE_FEES">Acceptance Fees</option>
          <option value="HOSTEL_FEES">Hostel Fees</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1.5">Amount (₦)</label>
        <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} required className="input-field" />
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1.5">Due Date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="input-field" />
      </div>
      <button type="submit" disabled={!studentId || mutation.isPending} className="btn-primary flex items-center gap-2 justify-center">
        <Plus size={16} />
        Create
      </button>

      {result && (
        <div
          className={`col-span-full text-sm rounded-lg px-4 py-3 border ${
            result.type === "success" ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan" : "bg-danger/10 border-danger/30 text-danger"
          }`}
        >
          {result.text}
        </div>
      )}
    </form>
  );
}

function InvoiceList() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: () => api.get<{ data: Invoice[] }>("/admin/finance/invoices?pageSize=20"),
  });

  if (isLoading) return <div className="text-text-muted font-mono text-sm">Loading…</div>;
  if (!data || data.data.length === 0) return <div className="glass-panel p-8 text-center text-text-muted text-sm">No invoices yet.</div>;

  return (
    <div className="glass-panel divide-y divide-border">
      {data.data.map((inv) => (
        <div key={inv.id} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-text-primary">{inv.student.firstName} {inv.student.lastName}</p>
            <p className="text-xs text-text-muted">
              <span className="font-mono text-accent-cyan">{inv.student.matricNumber}</span> · {inv.type.replace(/_/g, " ")} · {naira(inv.amount)}
            </p>
          </div>
          <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${STATUS_STYLE[inv.status]}`}>{inv.status}</span>
        </div>
      ))}
    </div>
  );
}
