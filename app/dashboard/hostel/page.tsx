"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Home } from "lucide-react";

interface Allocation {
  roomNo: string;
  allocatedAt: string;
  hostel: { name: string };
}

export default function StudentHostelPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-hostel"],
    queryFn: () => api.get<Allocation | null>("/students/me/hostel"),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Hostel</h1>
      <p className="text-text-muted text-sm mb-6">Your accommodation status.</p>

      {isLoading ? (
        <div className="text-text-muted font-mono text-sm">Loading…</div>
      ) : !data ? (
        <div className="glass-panel p-8 text-center">
          <Home className="mx-auto mb-3 text-text-faint" size={28} />
          <p className="text-text-muted text-sm">
            You have not been allocated a hostel room yet. Contact the Hostel Administration office.
          </p>
        </div>
      ) : (
        <div className="glass-panel p-6">
          <p className="id-badge mb-3">{data.hostel.name}</p>
          <p className="text-text-primary text-lg font-display">Room {data.roomNo}</p>
          <p className="text-text-muted text-sm mt-1">
            Allocated {new Date(data.allocatedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
