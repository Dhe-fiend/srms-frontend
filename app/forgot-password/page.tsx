"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/password-reset/request", { email }, { skipAuth: true });
    } finally {
      setSent(true);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/login" className="flex items-center gap-2 text-text-muted hover:text-accent-cyan text-sm mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to sign in
        </Link>

        <div className="glass-panel p-8">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-text-primary font-medium mb-2">Check your email</p>
              <p className="text-text-muted text-sm">
                If an account exists with that email, we&apos;ve sent a reset link. It expires in 30 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h1 className="font-display text-xl font-semibold text-text-primary mb-1">Reset your password</h1>
                <p className="text-text-muted text-sm">We&apos;ll send a reset link to your email.</p>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@student.srms.local"
              />
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
