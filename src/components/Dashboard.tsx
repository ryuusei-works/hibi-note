"use client";
import { memo } from "react";
import type { Section } from "@/types/ui";
import { useDashboard } from "@/hooks/useDashboard";
import { DashboardView } from "./DashboardView";
// Services update live tables, SVGs and layouts. Keep their DOM stable between React renders.
const StableView = memo(DashboardView);
export function Dashboard({ section }: { section: Section }) {
  useDashboard();
  return <StableView section={section} />;
}
