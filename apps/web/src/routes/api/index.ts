import { API_URL } from "@/config";
import type { APIEvent } from "@solidjs/start/server";

export async function GET(event: APIEvent) {
  const url = new URL(event.request.url);
  const queryParams = new URLSearchParams(url.search);
  const sort = (queryParams.get("sort") || "buy") as "buy" | "sell";

  try {
    const response = await fetch(
      `${API_URL}?sort=${sort}`
    );
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ message: "Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
