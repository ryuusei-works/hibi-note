export type { Section } from "./ui";
export interface SportsData {
  year: number;
  generatedAt: string;
  categories: unknown[];
  standings: Record<string, unknown>;
  leaders: Record<string, unknown>;
  [key: string]: unknown;
}
