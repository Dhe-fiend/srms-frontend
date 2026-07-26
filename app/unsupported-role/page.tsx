"use client";

import { useAuth } from "@/lib/auth-context";

export default function UnsupportedRolePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel p-8 max-w-md text-center">
        <p className="id-badge mb-4">{user?.roles.join(", ")}</p>
        <h1 className="font-display text-xl font-semibold text-text-primary mb-2">
          Portal not built yet
        </h1>
        <p className="text-text-muted text-sm mb-6">
          There&apos;s no dashboard for this role yet. The Student and Admin portals are live —
          Lecturer/HOD/Dean views are still on the roadmap.
        </p>
        <button onClick={logout} className="btn-ghost">Sign out</button>
      </div>
    </div>
  );
}
