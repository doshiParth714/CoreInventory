"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PackageCheck,
  Truck,
  Package,
  History,
  Settings,
  ArrowLeftRight,
  ClipboardList,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Operations",
    icon: ClipboardList,
    children: [
      { label: "Receipts", href: "/operations/receipts", icon: PackageCheck },
      { label: "Deliveries", href: "/operations/deliveries", icon: Truck },
      { label: "Transfers", href: "/operations/internal-transfers", icon: ArrowLeftRight },
      { label: "Adjustments", href: "/operations/adjustments", icon: ClipboardList },
    ],
  },
  { label: "Products", href: "/products", icon: Package },
  { label: "Warehouses", href: "/warehouses", icon: Warehouse },
  { label: "Move History", href: "/move-history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
];

function NavItem({ item, depth = 0 }: { item: (typeof navItems)[0]; depth?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(
    "children" in item ? item.children!.some((c) => pathname.startsWith(c.href!)) : false
  );
  const Icon = item.icon;

  if ("children" in item) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        {open && (
          <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
            {item.children!.map((child) => (
              <NavItem key={child.href} item={child} depth={1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href!);

  return (
    <Link
      href={item.href!}
      title={item.label}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

export function Sidebar({ userEmail, compact }: { userEmail?: string; compact?: boolean }) {
  const router = useRouter();
  const { logout } = useAuth();
  const sidebarW = compact ? "w-16" : "w-60";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className={`flex h-screen ${sidebarW} flex-col border-r border-white/10 bg-[#0d0f16] transition-all duration-300 overflow-hidden`}>
      <div className="flex h-16 items-center gap-2 px-3 border-b border-white/10 overflow-hidden">
        {!compact && <Logo compact />}
        {compact && <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mx-auto"><span className="text-indigo-400 font-bold text-sm">I</span></div>}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => (
          compact
            ? ("href" in item
              ? (() => {
                  const Icon = item.icon;
                  const pathname = "/";
                  return (
                    <Link key={(item as any).href} href={(item as any).href!} title={item.label}
                      className="flex items-center justify-center rounded-lg p-2.5 text-slate-400 hover:text-white hover:bg-white/5 transition"
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  );
                })()
              : null)
            : <NavItem key={"href" in item ? item.href : item.label} item={item} />
        ))}
      </nav>

      <div className="border-t border-white/10 p-2 space-y-1">
        {compact ? (
          <>
            <Link href="/profile" title="My Profile" className="flex items-center justify-center rounded-lg p-2.5 text-slate-400 hover:text-white hover:bg-white/5 transition">
              <User className="h-5 w-5" />
            </Link>
            <button onClick={handleLogout} title="Logout" className="flex w-full items-center justify-center rounded-lg p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition">
              <LogOut className="h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            <Link href="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <User className="h-4 w-4" /> My Profile
            </Link>
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="h-4 w-4" /> Logout
            </button>
            {userEmail && <p className="px-3 pt-1 text-xs text-slate-600 truncate">{userEmail}</p>}
          </>
        )}
      </div>
    </aside>
  );
}
