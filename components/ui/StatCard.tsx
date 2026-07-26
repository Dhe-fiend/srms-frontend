interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "cyan" | "violet";
}

export function StatCard({ label, value, hint, accent = "cyan" }: StatCardProps) {
  const accentColor = accent === "cyan" ? "text-accent-cyan" : "text-accent-violet";

  return (
    <div className="glass-panel glass-panel-hover p-5">
      <p className="text-text-muted text-xs uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-display text-3xl font-semibold ${accentColor}`}>{value}</p>
      {hint && <p className="text-text-faint text-xs mt-1">{hint}</p>}
    </div>
  );
}
