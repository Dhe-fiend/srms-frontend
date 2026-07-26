"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, ClipboardCheck, LogOut, ShieldAlert } from "lucide-react";

export function StaffSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isLecturer = user?.roles.includes("LECTURER");
  const isHod = user?.roles.includes("HOD");

  return (
    <aside className="w-64 shrink-0 border-r border-border min-h-screen p-6 flex flex-col">
      <div className="mb-10">
        <div className="id-badge mb-1">CAC · STAFF</div>
        <p className="text-text-muted text-xs mt-2">Cyber Assassin College</p>
      </div>

      <nav className="flex-1 space-y-1">
        {isLecturer && (
          <Link
            href="/staff"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              pathname === "/staff"
                ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/25"
                : "text-text-muted hover:text-text-primary hover:bg-surface"
            }`}
          >
            <LayoutDashboard size={18} />
            My Courses
          </Link>
        )}
        {isHod && (
          <Link
            href="/staff/approvals"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              pathname.startsWith("/staff/approvals")
                ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/25"
                : "text-text-muted hover:text-text-primary hover:bg-surface"
            }`}
          >
            <ClipboardCheck size={18} />
            Pending Approvals
          </Link>
        )}
      </nav>

      <div className="pt-4 border-t border-border">
        {user && (
          <p className="text-xs text-text-faint mb-3 truncate flex items-center gap-1.5">
            <ShieldAlert size={12} />
            {user.roles.join(", ")}
          </p>
        )}
        <button onClick={logout} className="flex items-center gap-2 text-sm text-text-muted hover:text-danger transition-colors">
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
