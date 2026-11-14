"use client";
import { useEffect } from "react";
import { createDashboardLifecycle } from "@/services/lifecycle";
import { mountSports } from "@/services/sports";
import { mountWorkspace } from "@/services/workspace";

export function useDashboard() {
  useEffect(() => {
    const scope = createDashboardLifecycle();
    try {
      const sports = mountSports(scope);
      mountWorkspace(sports, scope);
    } catch (error) {
      scope.dispose();
      throw error;
    }
    return () => scope.dispose();
  }, []);
}
