import { notFound } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { isSection, sections } from "@/utils/navigation";
export function generateStaticParams() {
  return sections
    .filter((section) => section !== "home")
    .map((section) => ({ section }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isSection(section)) notFound();
  return <Dashboard key={section} section={section} />;
}
