"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken, tryRefresh, ApiError } from "./api-client";

interface User {
  id: string;
  email: string;
  roles: string[];
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const ok = await tryRefresh();
      if (ok) {
        try {
          const me = await api.get<{ userId: string; roles: string[] }>("/me");
          setUser({ id: me.userId, email: "", roles: me.roles });
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function login(email: string, password: string): Promise<User> {
    const result = await api.post<{ accessToken: string; user: User }>(
      "/auth/login",
      { email, password },
      { skipAuth: true }
    );
    setAccessToken(result.accessToken);
    setUser(result.user);
    return result.user;
  }

  async function logout() {
    await api.post("/auth/logout").catch(() => undefined);
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
