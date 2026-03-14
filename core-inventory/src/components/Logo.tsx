"use client";

import Link from "next/link";
import Image from "next/image";

export default function Logo({ className = "", compact }: { className?: string; compact?: boolean }) {
  const w = compact ? 96 : 128;
  const h = compact ? 32 : 48;
  return (
    <Link href="/dashboard" className={`flex flex-col items-center justify-center transition hover:opacity-80 active:scale-95 ${className}`}>
      <div className={`relative flex items-center justify-center ${compact ? "h-10 w-32" : "h-24 w-56"}`}>
        <Image
          src="/logo.png"
          alt="Inventra Logo"
          fill
          className="object-contain dark:invert-0 drop-shadow-md"
          priority
          unoptimized
        />
      </div>
    </Link>
  );
}
