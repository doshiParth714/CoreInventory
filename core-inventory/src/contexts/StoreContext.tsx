"use client";

import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from "react";
import {
  initialStoreState,
  createStoreActions,
  type StoreState,
  type StoreActions,
} from "@/lib/store";

const STORAGE_KEY = "inventra_store_v7";

function loadState(): StoreState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoreState;
    if (parsed && Array.isArray(parsed.profiles) && !parsed.profiles.some((p) => p.loginId === "admin")) {
      const defaultAdmin = initialStoreState.profiles.find((p) => p.loginId === "admin");
      if (defaultAdmin) {
        parsed.profiles.push(defaultAdmin);
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveState(s: StoreState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (_) {}
}

interface StoreContextValue {
  state: StoreState;
  actions: StoreActions;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(() => loadState() ?? initialStoreState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo(() => {
    const getState = () => stateRef.current;
    const setStateWrapper = (updater: (s: StoreState) => StoreState) => setState(updater);
    const actions = createStoreActions(getState, setStateWrapper);
    return { state, actions };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
