"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { Plus } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
}

interface Loan {
  id: string;
  status: "BORROWED" | "RETURNED" | "OVERDUE";
  dueAt: string;
  fineAmount: number;
  book: { title: string; author: string };
  student: { firstName: string; lastName: string; matricNumber: string };
}

const STATUS_STYLE: Record<string, string> = {
  BORROWED: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
  OVERDUE: "bg-danger/10 text-danger border-danger/30",
  RETURNED: "bg-text-faint/10 text-text-faint border-text-faint/30",
};

export default function AdminLibraryPage() {
  const [tab, setTab] = useState<"catalogue" | "loans">("catalogue");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Library</h1>
      <p className="text-text-muted text-sm mb-6">Book catalogue and loan management.</p>

      <div className="flex gap-2 mb-6 border-b border-border">
        {(["catalogue", "loans"] as const).map((t) => (
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

      {tab === "catalogue" ? <CatalogueTab /> : <LoansTab />}
    </div>
  );
}

function CatalogueTab() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [totalCopies, setTotalCopies] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: books, isLoading } = useQuery({ queryKey: ["admin-books"], queryFn: () => api.get<Book[]>("/admin/library/books") });

  const createMutation = useMutation({
    mutationFn: () => api.post("/admin/library/books", { title, author, isbn, totalCopies: Number(totalCopies) }),
    onSuccess: () => {
      setTitle("");
      setAuthor("");
      setIsbn("");
      setTotalCopies("1");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Failed to add book."),
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
          <label className="block text-xs text-text-muted mb-1.5">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Author</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">ISBN</label>
          <input value={isbn} onChange={(e) => setIsbn(e.target.value)} required className="input-field" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-text-muted mb-1.5">Copies</label>
            <input type="number" min={1} value={totalCopies} onChange={(e) => setTotalCopies(e.target.value)} className="input-field" />
          </div>
          <button type="submit" disabled={createMutation.isPending} className="btn-primary px-3">
            <Plus size={16} />
          </button>
        </div>
        {error && <div className="col-span-full text-sm rounded-lg px-4 py-3 border bg-danger/10 border-danger/30 text-danger">{error}</div>}
      </form>

      {isLoading ? (
        <div className="text-text-muted font-mono text-sm">Loading…</div>
      ) : (
        <div className="glass-panel divide-y divide-border">
          {(books ?? []).map((b) => (
            <div key={b.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-text-primary">{b.title}</p>
                <p className="text-xs text-text-muted">{b.author} · <span className="font-mono">{b.isbn}</span></p>
              </div>
              <span className="text-text-muted text-sm">{b.availableCopies} / {b.totalCopies} available</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoansTab() {
  const queryClient = useQueryClient();
  const { data: loans, isLoading } = useQuery({ queryKey: ["admin-loans"], queryFn: () => api.get<Loan[]>("/admin/library/loans") });

  const returnMutation = useMutation({
    mutationFn: (loanId: string) => api.patch(`/admin/library/loans/${loanId}/return`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loans"] });
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
    },
  });

  if (isLoading) return <div className="text-text-muted font-mono text-sm">Loading…</div>;

  return (
    <div className="glass-panel divide-y divide-border">
      {(loans ?? []).map((loan) => (
        <div key={loan.id} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-text-primary">{loan.book.title}</p>
            <p className="text-xs text-text-muted">
              {loan.student.firstName} {loan.student.lastName} ·{" "}
              <span className="font-mono text-accent-cyan">{loan.student.matricNumber}</span> · Due {new Date(loan.dueAt).toLocaleDateString()}
              {loan.fineAmount > 0 && <span className="text-danger ml-2">Fine: ₦{loan.fineAmount}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${STATUS_STYLE[loan.status]}`}>{loan.status}</span>
            {loan.status !== "RETURNED" && (
              <button onClick={() => returnMutation.mutate(loan.id)} className="btn-ghost text-xs px-3 py-1.5">
                Mark Returned
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
