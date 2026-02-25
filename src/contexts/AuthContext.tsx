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
    if (typeof localStorage === "undefined") return "user";
    const r = localStorage.getItem(ROLE_KEY);
    if (r === "supplier" || r === "user") return r;
  } catch {
    // ignore (e.g. private mode, extension interference)
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
    let unsubscribe: (() => void) | null = null;
    (async () => {
      try {
        // Process Google redirect first so we don't show login before redirect is handled.
        // Otherwise onAuthStateChanged can fire with null before getRedirectResult runs.
        const redirectResult = await getRedirectResultOnLoad();
        
        if (cancelled) return;
        
        // If we got a redirect result, set the user immediately
        if (redirectResult?.user) {
          setUser(redirectResult.user);
        }
        
        // Now set up the auth state observer
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (!cancelled) {
            setUser(firebaseUser);
            // Only set loading to false after we've processed the redirect result
            // and the auth state has been updated
            setAuthLoading(false);
          }
        });
        
        // If we already have a user (e.g. from redirect), onAuthStateChanged fires sync;
        // otherwise we wait for it. Ensure we don't leave authLoading true forever.
        if (auth.currentUser && !cancelled) {
          setUser(auth.currentUser);
          setAuthLoading(false);
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const setRole = useCallback((r: AuthRole) => {
    setRoleState(r);
    try {
      if (typeof localStorage !== "undefined" && (r === "user" || r === "supplier")) {
        localStorage.setItem(ROLE_KEY, r);
      }
    } catch {
      // ignore (private mode, quota, or extension interference)
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
