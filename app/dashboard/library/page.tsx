"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";

interface Book {
  id: string;
  title: string;
  author: string;
  availableCopies: number;
}

interface Loan {
  id: string;
  status: "BORROWED" | "RETURNED" | "OVERDUE";
  dueAt: string;
  fineAmount: number;
  book: { title: string };
}

const STATUS_STYLE: Record<string, string> = {
  BORROWED: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
  OVERDUE: "bg-danger/10 text-danger border-danger/30",
  RETURNED: "bg-text-faint/10 text-text-faint border-text-faint/30",
};

export default function StudentLibraryPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: books, isLoading: loadingBooks } = useQuery({
    queryKey: ["library-catalogue"],
    queryFn: () => api.get<Book[]>("/students/me/library/catalogue"),
  });

  const { data: loans, isLoading: loadingLoans } = useQuery({
    queryKey: ["my-library-loans"],
    queryFn: () => api.get<Loan[]>("/students/me/library/loans"),
  });

  const borrowMutation = useMutation({
    mutationFn: (bookId: string) => api.post("/students/me/library/borrow", { bookId }),
    onSuccess: () => {
      setMessage({ type: "success", text: "Book borrowed. Due in 14 days." });
      queryClient.invalidateQueries({ queryKey: ["library-catalogue"] });
      queryClient.invalidateQueries({ queryKey: ["my-library-loans"] });
    },
    onError: (err) => setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Could not borrow this book." }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Library</h1>
      <p className="text-text-muted text-sm mb-6">Browse the catalogue and manage your borrowed books.</p>

      {message && (
        <div
          className={`mb-4 text-sm rounded-lg px-4 py-3 border ${
            message.type === "success" ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan" : "bg-danger/10 border-danger/30 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      {loans && loans.filter((l) => l.status !== "RETURNED").length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-sm font-semibold text-text-primary mb-3">My Borrowed Books</h2>
          <div className="glass-panel divide-y divide-border">
            {loans.filter((l) => l.status !== "RETURNED").map((l) => (
              <div key={l.id} className="flex items-center justify-between px-5 py-3">
                <p className="text-text-primary text-sm">{l.book.title}</p>
                <div className="flex items-center gap-3">
                  {l.fineAmount > 0 && <span className="text-danger text-xs">Fine: ₦{l.fineAmount}</span>}
                  <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${STATUS_STYLE[l.status]}`}>{l.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-display text-sm font-semibold text-text-primary mb-3">Catalogue</h2>
      {loadingBooks || loadingLoans ? (
        <div className="text-text-muted font-mono text-sm">Loading…</div>
      ) : (
        <div className="glass-panel divide-y divide-border">
          {(books ?? []).map((b) => (
            <div key={b.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-text-primary">{b.title}</p>
                <p className="text-xs text-text-muted">{b.author}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-text-muted text-xs">{b.availableCopies} available</span>
                <button
                  onClick={() => borrowMutation.mutate(b.id)}
                  disabled={b.availableCopies < 1 || borrowMutation.isPending}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  Borrow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
