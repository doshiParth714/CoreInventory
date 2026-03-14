"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Profile, StoreActions } from "@/lib/store";

const AUTH_KEY = "inventra_auth_v4";

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  loaded: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  signup: (email: string, loginId: string, password: string) => { ok: boolean; error?: string };
  resetPassword: (email: string, newPw: string) => { ok: boolean; error?: string };
  updateUser: (data: { email?: string; loginId?: string; password?: string }) => { ok: boolean; error?: string };
  /** Called by StoreAuthSync to inject store actions after mount */
  setStoreGetter: (getter: () => StoreActions) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadAuth(): AuthState {
  if (typeof window === "undefined") return { user: null, isAuthenticated: false };
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return { user: null, isAuthenticated: false };
    return JSON.parse(raw) as AuthState;
  } catch {
    return { user: null, isAuthenticated: false };
  }
}

function saveAuth(state: AuthState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  } catch (_) {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => loadAuth());
  const [loaded, setLoaded] = useState(false);

  // Mark as loaded after first client-side render
  useEffect(() => {
    setLoaded(true);
  }, []);

  // Ref to store actions — populated by StoreAuthSync once the store is ready
  const storeActionsRef = useRef<StoreActions | null>(null);

  const setStoreGetter = useCallback((getter: () => StoreActions) => {
    storeActionsRef.current = getter();
  }, []);

  // Persist auth to localStorage whenever it changes
  useEffect(() => {
    saveAuth(authState);
  }, [authState]);

  const login = useCallback(
    (emailOrUsername: string, password: string): { ok: boolean; error?: string } => {
      const actions = storeActionsRef.current;

      if (!actions) {
        return { ok: false, error: "Store not ready. Please try again." };
      }

      let profile = actions.getProfileByEmail(emailOrUsername);
      if (!profile) {
        profile = actions.getProfileByLoginId(emailOrUsername);
      }

      if (!profile) {
        return { ok: false, error: "No account found with those details." };
      }

      if (profile.password !== password) {
        return { ok: false, error: "Incorrect password." };
      }

      const newState: AuthState = { user: profile, isAuthenticated: true };
      setAuthState(newState);
      return { ok: true };
    },
    []
  );

  const logout = useCallback(() => {
    const cleared: AuthState = { user: null, isAuthenticated: false };
    setAuthState(cleared);
    saveAuth(cleared);
  }, []);

  const signup = useCallback(
    (email: string, loginId: string, password: string): { ok: boolean; error?: string } => {
      const actions = storeActionsRef.current;
      if (!actions) return { ok: false, error: "Store not ready. Please try again." };
      
      const existingEmail = actions.getProfileByEmail(email);
      if (existingEmail) return { ok: false, error: "Email already exists." };
      
      const existingId = actions.getProfileByLoginId(loginId);
      if (existingId) return { ok: false, error: "Login ID already taken." };
      
      actions.addProfile({ email, loginId, password });
      
      const profile = actions.getProfileByEmail(email);
      if (profile) {
        setAuthState({ user: profile, isAuthenticated: true });
      }
      return { ok: true };
    },
    []
  );

  const resetPassword = useCallback(
    (email: string, newPw: string): { ok: boolean; error?: string } => {
      const actions = storeActionsRef.current;
      if (!actions) return { ok: false, error: "Store not ready. Please try again." };
      
      const existing = actions.getProfileByEmail(email);
      if (!existing) return { ok: false, error: "Account not found." };
      
      actions.updateProfile(existing.id, { password: newPw });
      return { ok: true };
    },
    []
  );

  const updateUser = useCallback(
    (data: { email?: string; loginId?: string; password?: string }): { ok: boolean; error?: string } => {
      const actions = storeActionsRef.current;
      if (!actions) return { ok: false, error: "Store not ready." };
      if (!authState.user) return { ok: false, error: "Not logged in." };

      if (data.email && data.email !== authState.user.email) {
        if (actions.getProfileByEmail(data.email)) return { ok: false, error: "Email already taken." };
      }
      if (data.loginId && data.loginId !== authState.user.loginId) {
        if (actions.getProfileByLoginId(data.loginId)) return { ok: false, error: "Login ID already taken." };
      }

      actions.updateProfile(authState.user.id, data);
      
      const updatedUser = { ...authState.user, ...data };
      setAuthState({ user: updatedUser, isAuthenticated: true });
      return { ok: true };
    },
    [authState.user]
  );

  const value: AuthContextValue = {
    ...authState,
    loaded,
    login,
    logout,
    signup,
    resetPassword,
    updateUser,
    setStoreGetter,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
