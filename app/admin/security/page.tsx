"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: { email: string } | null;
}

interface LoginLog {
  id: string;
  email: string;
  success: boolean;
  reason: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface SystemSetting {
  key: string;
  value: string;
}

const SETTING_LABELS: Record<string, string> = {
  MFA_REQUIRED: "Require MFA",
  PASSWORD_MIN_LENGTH: "Minimum Password Length",
  SESSION_TIMEOUT_MINUTES: "Session Timeout (minutes)",
  MAX_LOGIN_ATTEMPTS: "Max Login Attempts Before Lockout",
  LOG_LEVEL: "Log Level",
};

export default function SecurityPage() {
  const [tab, setTab] = useState<"audit" | "logins" | "settings">("audit");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Security Center</h1>
      <p className="text-text-muted text-sm mb-6">Audit trail, login history, and system configuration.</p>

      <div className="flex gap-2 mb-6 border-b border-border">
        {(["audit", "logins", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm capitalize border-b-2 transition-colors ${
              tab === t ? "border-accent-violet text-accent-violet" : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {t === "audit" ? "Audit Log" : t === "logins" ? "Login History" : "Settings"}
          </button>
        ))}
      </div>

      {tab === "audit" && <AuditLogTab />}
      {tab === "logins" && <LoginLogTab />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}

function AuditLogTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => api.get<{ data: AuditLog[] }>("/admin/security/audit-logs?pageSize=30"),
  });

  if (isLoading) return <div className="text-text-muted font-mono text-sm">Loading…</div>;

  return (
    <div className="glass-panel divide-y divide-border">
      {(data?.data ?? []).map((log) => (
        <div key={log.id} className="px-5 py-3 flex items-center justify-between text-sm">
          <div>
            <span className="font-mono text-accent-violet text-xs">{log.action}</span>
            <span className="text-text-muted ml-2">
              {log.entityType}{log.entityId ? ` · ${log.entityId.slice(0, 8)}…` : ""}
            </span>
          </div>
          <div className="text-right text-xs text-text-faint">
            <p>{log.user?.email ?? "system"}</p>
            <p>{new Date(log.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoginLogTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["login-logs"],
    queryFn: () => api.get<{ data: LoginLog[] }>("/admin/security/login-logs?pageSize=30"),
  });

  if (isLoading) return <div className="text-text-muted font-mono text-sm">Loading…</div>;

  return (
    <div className="glass-panel divide-y divide-border">
      {(data?.data ?? []).map((log) => (
        <div key={log.id} className="px-5 py-3 flex items-center justify-between text-sm">
          <div>
            <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${
              log.success ? "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30" : "bg-danger/10 text-danger border-danger/30"
            }`}>
              {log.success ? "SUCCESS" : "FAILED"}
            </span>
            <span className="text-text-primary ml-2">{log.email}</span>
            {log.reason && <span className="text-text-faint ml-2 text-xs">({log.reason})</span>}
          </div>
          <div className="text-right text-xs text-text-faint">
            <p>{log.ipAddress}</p>
            <p>{new Date(log.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsTab() {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: () => api.get<SystemSetting[]>("/admin/security/settings"),
  });

  const updateMutation = useMutation({
    mutationFn: (params: { key: string; value: string }) => api.put(`/admin/security/settings/${params.key}`, { value: params.value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["system-settings"] }),
    onSettled: () => setPendingKey(null),
  });

  if (isLoading) return <div className="text-text-muted font-mono text-sm">Loading…</div>;

  return (
    <div>
      <div className="mb-4 text-sm rounded-lg px-4 py-3 border bg-warn/10 border-warn/30 text-warn">
        <strong>Password Length</strong>, <strong>Max Login Attempts</strong>, and <strong>Session Timeout</strong> are now live —
        changes take effect on the next request. <strong>MFA Required</strong> is stored but not enforced (no MFA flow exists yet).
        <strong>Log Level</strong> is stored but not wired to the logger (requires a restart-based config, not runtime).
      </div>
      <div className="glass-panel divide-y divide-border">
        {(data ?? []).map((s) => (
          <div key={s.key} className="px-5 py-4 flex items-center justify-between gap-4">
            <label className="text-text-primary text-sm">{SETTING_LABELS[s.key] ?? s.key}</label>
            {s.key === "MFA_REQUIRED" ? (
              <select
                defaultValue={s.value}
                disabled={pendingKey === s.key}
                onChange={(e) => {
                  setPendingKey(s.key);
                  updateMutation.mutate({ key: s.key, value: e.target.value });
                }}
                className="input-field w-32"
              >
                <option value="false">Disabled</option>
                <option value="true">Enabled</option>
              </select>
            ) : (
              <input
                defaultValue={s.value}
                disabled={pendingKey === s.key}
                onBlur={(e) => {
                  if (e.target.value !== s.value) {
                    setPendingKey(s.key);
                    updateMutation.mutate({ key: s.key, value: e.target.value });
                  }
                }}
                className="input-field w-32"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
