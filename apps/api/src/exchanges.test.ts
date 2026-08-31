import { afterEach, expect, spyOn, test } from "bun:test";
import { getAllData } from "./exchanges";
import { providerNames } from "./providers/types";

const originalFetch = globalThis.fetch;
let consoleErrorSpy: ReturnType<typeof spyOn> | undefined;

const useFetch = (
  implementation: (...args: Parameters<typeof fetch>) => ReturnType<typeof fetch>
) => {
  globalThis.fetch = Object.assign(implementation, {
    preconnect: originalFetch.preconnect,
  });
};

afterEach(() => {
  globalThis.fetch = originalFetch;
  consoleErrorSpy?.mockRestore();
  consoleErrorSpy = undefined;
});

test("logs structured diagnostics for every failed provider", async () => {
  consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
  useFetch(async () => Response.json({}, { status: 502 }));

  await getAllData();

  const logs: unknown[] = consoleErrorSpy.mock.calls.map(
    (call: unknown[]) => call[0]
  );

  expect(logs).toHaveLength(providerNames.length);
  for (const provider of providerNames) {
    expect(logs).toContainEqual({
      event: "provider_fetch_failed",
      provider,
      status: 502,
      durationMs: expect.any(Number),
      error: `${provider} request failed with status 502`,
    });
  }
});
