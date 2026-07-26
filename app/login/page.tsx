"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth-context";
import { destinationForRoles } from "@/lib/role-routing";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      router.push(destinationForRoles(loggedInUser.roles));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="id-badge mb-4">CAC · CYBER ASSASSIN COLLEGE</div>
          <h1 className="font-display text-3xl font-semibold text-text-primary">Sign In</h1>
          <p className="text-text-muted text-sm mt-1">Access your portal</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-5">
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm text-text-muted mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@srms.local"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-text-muted mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••••"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
            <ShieldCheck size={18} />
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <a href="/forgot-password" className="block text-center text-sm text-text-muted hover:text-accent-cyan transition-colors">
            Forgot your password?
          </a>
        </form>
      </div>
    </div>
  );
}
