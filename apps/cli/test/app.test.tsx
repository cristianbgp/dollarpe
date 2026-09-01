import { afterEach, describe, expect, mock, test } from "bun:test";
import { stripVTControlCharacters } from "node:util";
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

const plainText = (frame: string | undefined) =>
  stripVTControlCharacters(frame ?? "");

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
});

describe("exchange-rate presentation", () => {
  test("renders every exchange rate", () => {
    const { lastFrame } = render(<ExchangeList data={rates} sort="buy" />);
    const frame = plainText(lastFrame());

    expect(frame).toContain("rextie");
    expect(frame).toContain("buy: 3.34");
    expect(frame).toContain("sell: 3.37");
    expect(frame).toContain("sunat");
  });

  test("renders the existing invalid-sort error", () => {
    const { lastFrame } = render(<App sort={"unknown" as Sort} />);

    expect(plainText(lastFrame())).toBe(
      "Invalid sort option. Use 'buy' or 'sell'.",
    );
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

    expect(plainText(view.lastFrame())).toContain("Something went wrong");
    view.unmount();
  });

  test("renders a historical official rate", async () => {
    globalThis.fetch = mock(async (input) => {
      if (
        String(input) !==
        "https://dollarpe-api.cristianbgp.com/official-rate?date=2025-11-17"
      ) {
        return new Response("Unexpected request", { status: 400 });
      }

      return Response.json({
        source: "sunat",
        date: "2025-11-17",
        buy: 3.365,
        sell: 3.374,
        pageUrl: "https://e-consulta.sunat.gob.pe/cl-at-ittipcam/tcS01Alias",
      });
    }) as typeof fetch;
    const view = render(
      <App command="official-rate" date="2025-11-17" sort="buy" />,
    );

    await Bun.sleep(50);

    const frame = plainText(view.lastFrame());
    expect(frame).toContain("official rate");
    expect(frame).toContain("date: 2025-11-17");
    expect(frame).toContain("buy: 3.365");
    expect(frame).toContain("sell: 3.374");
    view.unmount();
  });
});
