"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { roleAllowedIn, destinationForRoles } from "@/lib/role-routing";
import { AdminSidebar } from "@/components/ui/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!roleAllowedIn(user.roles, "admin")) {
      router.replace(destinationForRoles(user.roles));
    }
  }, [user, loading, router]);

  if (loading || !user || !roleAllowedIn(user.roles, "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-muted font-mono text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-6xl">{children}</main>
    </div>
  );
}
