import { getNewsData } from "@/services/news-data";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const region = new URL(request.url).searchParams.get("region") || "13";
  if (!/^(?:0[1-9]|[1-3][0-9]|4[0-7])$/.test(region))
    return Response.json(
      { error: "地域の指定が正しくありません。" },
      { status: 400 },
    );
  return Response.json(await getNewsData(region, request.method === "POST"), {
    headers: { "Cache-Control": "no-store" },
  });
}
export const POST = GET;
