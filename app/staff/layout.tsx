"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { roleAllowedIn, destinationForRoles } from "@/lib/role-routing";
import { StaffSidebar } from "@/components/ui/StaffSidebar";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!roleAllowedIn(user.roles, "staff")) {
      router.replace(destinationForRoles(user.roles));
    }
  }, [user, loading, router]);

  if (loading || !user || !roleAllowedIn(user.roles, "staff")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-muted font-mono text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <StaffSidebar />
      <main className="flex-1 p-8 max-w-6xl">{children}</main>
    </div>
  );
}
