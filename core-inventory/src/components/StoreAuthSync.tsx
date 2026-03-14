"use client";

import { useEffect } from "react";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";

export default function StoreAuthSync() {
  const { actions } = useStore();
  const { setStoreGetter } = useAuth();
  useEffect(() => {
    setStoreGetter(() => actions);
  }, [actions, setStoreGetter]);
  return null;
}
