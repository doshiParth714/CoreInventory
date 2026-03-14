"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loaded } = useAuth();

  useEffect(() => {
    if (!loaded) return;
    if (!user) router.replace("/login");
    else router.replace("/dashboard");
  }, [loaded, user, router]);

  return null;
}
