"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, Users, Landmark, Wallet, Home, ShieldCheck, BookOpen, LogOut, ShieldAlert } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/students", label: "Students", icon: Users, exact: false },
  { href: "/admin/academic", label: "Academic Structure", icon: Landmark, exact: false },
  { href: "/admin/finance", label: "Finance", icon: Wallet, exact: false },
  { href: "/admin/hostel", label: "Hostel", icon: Home, exact: false },
  { href: "/admin/library", label: "Library", icon: BookOpen, exact: false },
  { href: "/admin/security", label: "Security Center", icon: ShieldCheck, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 border-r border-border min-h-screen p-6 flex flex-col">
      <div className="mb-10">
        <div className="id-badge mb-1 border-accent-violet/25 text-accent-violet bg-accent-violet/10">
          CAC · ADMIN
        </div>
        <p className="text-text-muted text-xs mt-2">Cyber Assassin College</p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? "bg-accent-violet/10 text-accent-violet border border-accent-violet/25"
                  : "text-text-muted hover:text-text-primary hover:bg-surface"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
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
