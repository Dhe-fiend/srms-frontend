"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface Invoice {
  id: string;
  type: string;
  amount: number;
  amountPaid: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
  dueDate: string;
}

const STATUS_STYLE: Record<Invoice["status"], string> = {
  UNPAID: "bg-danger/10 text-danger border-danger/30",
  PARTIAL: "bg-warn/10 text-warn border-warn/30",
  PAID: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
};

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-invoices"],
    queryFn: () => api.get<Invoice[]>("/students/me/invoices"),
  });

  const payMutation = useMutation({
    mutationFn: (invoiceId: string) => api.post(`/students/me/invoices/${invoiceId}/pay`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-invoices"] }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Payments</h1>
      <p className="text-text-muted text-sm mb-6">
        Simulated payment gateway — no real transactions occur. For testing/lab use only.
      </p>

      {isLoading ? (
        <div className="text-text-muted font-mono text-sm">Loading invoices…</div>
      ) : !data || data.length === 0 ? (
        <div className="glass-panel p-8 text-center text-text-muted text-sm">No invoices on your account yet.</div>
      ) : (
        <div className="space-y-3">
          {data.map((inv) => (
            <div key={inv.id} className="glass-panel p-5 flex items-center justify-between">
              <div>
                <p className="text-text-primary font-medium">{inv.type.replace(/_/g, " ")}</p>
                <p className="text-text-muted text-sm">
                  Due {new Date(inv.dueDate).toLocaleDateString()} · ₦{inv.amount.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${STATUS_STYLE[inv.status]}`}>
                  {inv.status}
                </span>
                {inv.status !== "PAID" && (
                  <button
                    className="btn-primary text-sm px-4 py-2"
                    onClick={() => payMutation.mutate(inv.id)}
                    disabled={payMutation.isPending}
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
