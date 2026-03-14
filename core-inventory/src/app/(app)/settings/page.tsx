"use client";

import { useSettings } from "@/contexts/SettingsContext";
import { Globe, Bell, Shield, Monitor, Moon, Sun } from "lucide-react";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0f1117] ${
        on ? "bg-indigo-500 border-indigo-500" : "bg-slate-700 border-slate-700"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}


export default function SettingsPage() {
  const { settings, update } = useSettings();

  function toggle(key: keyof typeof settings) {
    update({ [key]: !settings[key] } as any);
  }

  const SettingRow = ({
    label,
    desc,
    settingKey,
  }: {
    label: string;
    desc: string;
    settingKey: keyof typeof settings;
  }) => (
    <div className="flex items-center justify-between py-4">
      <div className="space-y-0.5 pr-8">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      <Toggle on={!!settings[settingKey]} onToggle={() => toggle(settingKey)} />
    </div>
  );

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Website Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Control your application behaviour and preferences
        </p>
      </div>

      {/* General */}
      <section className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/2">
          <Globe className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">General</h2>
        </div>
        <div className="px-5 divide-y divide-white/5">
          <SettingRow
            label="Maintenance Mode"
            desc="Lock the platform and show a maintenance banner to all users"
            settingKey="maintenance"
          />
          <SettingRow
            label="Public Registration"
            desc="Allow new users to register via the sign-up screen"
            settingKey="publicRegistration"
          />
        </div>
        {settings.maintenance && (
          <div className="mx-5 mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400">
            ⚠️ Maintenance mode is <strong>active</strong>. A banner is now showing at the
            top of every authenticated page.
          </div>
        )}
      </section>

      {/* Appearance */}
      <section className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/2">
          <Monitor className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-white">Appearance</h2>
        </div>
        <div className="px-5 pt-4 pb-2 space-y-4">
          <div>
            <p className="text-sm font-medium text-white mb-2">Theme</p>
            <div className="flex gap-2">
              {(["dark", "light", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update({ theme: t })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition ${
                    settings.theme === t
                      ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                      : "border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {t === "dark" && <Moon className="h-3.5 w-3.5" />}
                  {t === "light" && <Sun className="h-3.5 w-3.5" />}
                  {t === "system" && <Monitor className="h-3.5 w-3.5" />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Active theme: <span className="text-slate-300 font-medium">{settings.theme}</span>.
              {settings.theme !== "dark" ? " The page colour scheme updates immediately." : ""}
            </p>
          </div>
          <div className="h-px bg-white/5" />
          <SettingRow
            label="Compact Sidebar"
            desc="Collapse the sidebar to icon-only mode for more screen space"
            settingKey="compactSidebar"
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/2">
          <Bell className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Notifications</h2>
        </div>
        <div className="px-5 divide-y divide-white/5">
          <SettingRow
            label="Email Notifications"
            desc="Receive email updates on key inventory events"
            settingKey="emailNotifications"
          />
          <SettingRow
            label="Low-Stock Alerts"
            desc="Get a dashboard warning when items drop below their reorder point"
            settingKey="stockAlerts"
          />
        </div>
      </section>

      {/* Security */}
      <section className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/2">
          <Shield className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Security</h2>
        </div>
        <div className="px-5 divide-y divide-white/5">
          <SettingRow
            label="Two-Factor Authentication"
            desc="Require OTP verification when logging in (demo — logs to console)"
            settingKey="twoFactor"
          />
        </div>
        {settings.twoFactor && (
          <div className="mx-5 mb-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400">
            🔒 2FA is <strong>enabled</strong>. In a production build this would trigger an OTP
            verification step on login.
          </div>
        )}
      </section>

      <p className="text-xs text-slate-600 text-center pb-4">
        All settings persist in your browser's local storage.
      </p>
    </div>
  );
}
