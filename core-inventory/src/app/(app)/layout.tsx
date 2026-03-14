"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Sidebar } from "@/components/layout/Sidebar";
import FloatingBoxes from "@/components/animations/FloatingBoxes";
import { AlertTriangle } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loaded } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();

  useEffect(() => {
    if (!loaded) return;
    if (!user) router.replace("/login");
  }, [loaded, user, router]);

  if (!loaded || !user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1117] relative">
      <FloatingBoxes bgTransparent />

      {/* Maintenance Mode Banner */}
      {settings.maintenance && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur text-black text-xs font-semibold flex items-center justify-center gap-2 py-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          Maintenance Mode is ON — the platform is locked for regular users
        </div>
      )}

      <Sidebar
        userEmail={user.email}
        compact={settings.compactSidebar}
      />

      <main
        className="flex-1 overflow-y-auto bg-[#0f1117]/80 backdrop-blur-md relative z-10"
        style={{ marginTop: settings.maintenance ? "28px" : 0 }}
      >
        {children}
      </main>
    </div>
  );
}
