"use client";

import { useEffect } from "react";

export function useNavigationGuard(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = "";
    }

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [enabled]);
}
