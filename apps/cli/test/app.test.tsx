import { afterEach, describe, expect, mock, test } from "bun:test";
import React from "react";
import { render } from "ink-testing-library";
import App, {
  ExchangeList,
  type ResponseData,
  type Sort,
} from "../source/app.js";

const rates: ResponseData = [
  ["rextie", { buy: 3.34, sell: 3.37, pageUrl: "https://rextie.com" }],
  ["sunat", { buy: 3.33, sell: 3.38, pageUrl: "https://sunat.gob.pe" }],
];

const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
});

describe("exchange-rate presentation", () => {
  test("renders every exchange rate", () => {
    const { lastFrame } = render(<ExchangeList data={rates} sort="buy" />);

    expect(lastFrame()).toContain("rextie");
    expect(lastFrame()).toContain("buy: 3.34");
    expect(lastFrame()).toContain("sell: 3.37");
    expect(lastFrame()).toContain("sunat");
  });

  test("renders the existing invalid-sort error", () => {
    const { lastFrame } = render(<App sort={"unknown" as Sort} />);

    expect(lastFrame()).toBe("Invalid sort option. Use 'buy' or 'sell'.");
  });

  test("renders the fallback when the API rejects the request", async () => {
    console.error = mock(() => {});
    globalThis.fetch = mock(
      async () =>
        new Response(
          JSON.stringify({
            error: "No providers available",
            code: "UPSTREAM_UNAVAILABLE",
            message: "No providers available",
            hint: "Try again later",
          }),
          { status: 503 },
        ),
    ) as typeof fetch;
    const view = render(<App sort="buy" />);

    await Bun.sleep(50);

    expect(view.lastFrame()).toContain("Something went wrong");
    view.unmount();
  });
});
