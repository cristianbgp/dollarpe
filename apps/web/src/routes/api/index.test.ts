import { afterEach, describe, expect, mock, test } from "bun:test";
import type { APIEvent } from "@solidjs/start/server";
import { GET } from "./index";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function createEvent(sort: string): APIEvent {
  return {
    request: new Request(`http://localhost/api?sort=${sort}`),
  } as APIEvent;
}

describe("GET /api", () => {
  test("returns exchange data with the existing CDN cache policy", async () => {
    const body = [
      ["rextie", { buy: 3.34, sell: 3.37, pageUrl: "https://rextie.com" }],
    ];
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify(body), { status: 200 }),
    ) as unknown as typeof fetch;

    const response = await GET(createEvent("sell"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(body);
    expect(response.headers.get("cache-control")).toBe(
      "public, s-maxage=60, stale-while-revalidate=30",
    );
  });

  test.each([400, 503])(
    "preserves a structured %i API error",
    async (status) => {
      const body = {
        error: "Exchange request failed",
        code: status === 400 ? "INVALID_SORT" : "UPSTREAM_UNAVAILABLE",
        message: "Exchange request failed",
        hint: "Try again",
      };
      globalThis.fetch = mock(
        async () => new Response(JSON.stringify(body), { status }),
      ) as unknown as typeof fetch;

      const response = await GET(
        createEvent(status === 400 ? "invalid" : "buy"),
      );

      expect(response.status).toBe(status);
      expect(await response.json()).toEqual(body);
      expect(response.headers.get("cache-control")).toBeNull();
    },
  );
});
