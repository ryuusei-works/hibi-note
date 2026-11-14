import { getSportsData } from "@/services/sports-data";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const { data, state } = await getSportsData();
  return Response.json(data, {
    headers: { "Cache-Control": "no-store", "X-Data-Update": state },
  });
}
export async function POST() {
  return GET();
}
