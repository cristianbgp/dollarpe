import { afterEach, expect, mock, test } from "bun:test";
import { listExchangeRates } from "../source/generated/dollarpe";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("requests sorted exchange rates from the production API", async () => {
  let requestedUrl = "";
  globalThis.fetch = mock(async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response(
      JSON.stringify([
        ["rextie", { buy: 3.34, sell: 3.37, pageUrl: "https://rextie.com" }],
      ]),
      { status: 200 },
    );
  }) as typeof fetch;

  const response = await listExchangeRates({ sort: "sell" });

  expect(requestedUrl).toBe(
    "https://dollarpe-api.cristianbgp.com/exchanges?sort=sell",
  );
  expect(response.data[0]).toEqual([
    "rextie",
    { buy: 3.34, sell: 3.37, pageUrl: "https://rextie.com" },
  ]);
});

test("throws a structured API error for unsuccessful responses", async () => {
  const body = {
    error: "No providers available",
    code: "UPSTREAM_UNAVAILABLE",
    message: "No providers available",
    hint: "Try again later",
  };
  globalThis.fetch = mock(
    async () => new Response(JSON.stringify(body), { status: 503 }),
  ) as typeof fetch;

  try {
    await listExchangeRates();
    throw new Error("Expected listExchangeRates to reject");
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({ status: 503, info: body });
  }
});
