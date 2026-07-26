"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, BookOpen, GraduationCap, Wallet, Home, Library, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/results", label: "Results", icon: GraduationCap },
  { href: "/dashboard/invoices", label: "Payments", icon: Wallet },
  { href: "/dashboard/hostel", label: "Hostel", icon: Home },
  { href: "/dashboard/library", label: "Library", icon: Library },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 border-r border-border min-h-screen p-6 flex flex-col">
      <div className="mb-10">
        <div className="id-badge mb-1">CAC</div>
        <p className="text-text-muted text-xs mt-2">Cyber Assassin College</p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/25"
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
        {user && <p className="text-xs text-text-faint mb-3 truncate">{user.roles.join(", ")}</p>}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-danger transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
