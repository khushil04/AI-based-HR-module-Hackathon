import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../types/auth";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "ai-hrms-auth";

const getInitialAuthState = (): { token: string | null; user: AuthUser | null } => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return { token: null, user: null };
  }

  try {
    return JSON.parse(raw) as { token: string; user: AuthUser };
  } catch {
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initial = getInitialAuthState();
  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<AuthUser | null>(initial.user);

  const setAuth = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: newToken, user: newUser }));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      setAuth,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
