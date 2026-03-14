"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const SETTINGS_KEY = "inventra_settings_v1";

export interface AppSettings {
  maintenance: boolean;
  publicRegistration: boolean;
  emailNotifications: boolean;
  stockAlerts: boolean;
  twoFactor: boolean;
  theme: "dark" | "light" | "system";
  compactSidebar: boolean;
}

const defaults: AppSettings = {
  maintenance: false,
  publicRegistration: true,
  emailNotifications: true,
  stockAlerts: true,
  twoFactor: false,
  theme: "dark",
  compactSidebar: false,
};

interface SettingsCtx {
  settings: AppSettings;
  update: (patch: Partial<AppSettings>) => void;
}

const Ctx = createContext<SettingsCtx>({ settings: defaults, update: () => {} });
export const useSettings = () => useContext(Ctx);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaults);

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...defaults, ...JSON.parse(raw) });
    } catch {}
  }, []);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark =
      settings.theme === "dark" || (settings.theme === "system" && prefersDark);

    root.classList.toggle("dark", isDark);
    root.classList.toggle("light-mode", !isDark);
  }, [settings.theme]);

  function update(patch: Partial<AppSettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  return <Ctx.Provider value={{ settings, update }}>{children}</Ctx.Provider>;
}
