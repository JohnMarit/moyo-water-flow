import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User } from "firebase/auth";
import { auth, getRedirectResultOnLoad } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { signOut as firebaseSignOut } from "@/lib/firebase";

const ROLE_KEY = "moyo_user_role";
export type AuthRole = "user" | "supplier";

interface AuthState {
  user: User | null;
  /** True until Firebase has reported initial auth state (avoids flash/errors on refresh) */
  authLoading: boolean;
  role: AuthRole;
  /** Set by mock email/password form only; not persisted, so refresh sends user to /auth */
  mockAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  setRole: (role: AuthRole) => void;
  setMockAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredRole(): AuthRole {
  try {
    const r = localStorage.getItem(ROLE_KEY);
    if (r === "supplier" || r === "user") return r;
  } catch {
    // ignore
  }
  return "user";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRoleState] = useState<AuthRole>(getStoredRole);
  const [mockAuthenticated, setMockAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getRedirectResultOnLoad().then(() => {
      if (!cancelled) {
        // Auth state will update via onAuthStateChanged after redirect result is processed
      }
    });
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!cancelled) {
        setUser(firebaseUser);
        setAuthLoading(false);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const setRole = useCallback((r: AuthRole) => {
    setRoleState(r);
    try {
      localStorage.setItem(ROLE_KEY, r);
    } catch {
      // ignore
    }
  }, []);

  const signOut = useCallback(async () => {
    setMockAuthenticated(false);
    await firebaseSignOut();
  }, []);

  const value: AuthContextValue = {
    user,
    authLoading,
    role,
    mockAuthenticated,
    signOut,
    setRole,
    setMockAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
