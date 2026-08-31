import {
  afterEach,
  beforeEach,
  describe,
  expect,
  spyOn,
  test,
} from "bun:test";
import app from "./index";

const originalFetch = globalThis.fetch;
let consoleErrorSpy: ReturnType<typeof spyOn> | undefined;

const useFetch = (
  implementation: (...args: Parameters<typeof fetch>) => ReturnType<typeof fetch>
) => {
  globalThis.fetch = Object.assign(implementation, {
    preconnect: originalFetch.preconnect,
  });
};

const jsonResponse = (body: unknown, status = 200) =>
  Response.json(body, { status });

const rextieResponse = {
  fx_rate_buy: "3.33",
  fx_rate_sell: "3.36",
};

const kambistaResponse = {
  tc: {
    bid: 3.32,
    ask: 3.37,
  },
};

afterEach(() => {
  globalThis.fetch = originalFetch;
  consoleErrorSpy?.mockRestore();
  consoleErrorSpy = undefined;
});

beforeEach(() => {
  consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
});

test("GET / keeps the concise endpoint index as plain text by default", async () => {
  const response = await app.request("/");
  const body = await response.text();

  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toContain("text/plain");
  expect(response.headers.get("Vary")).toBe("Accept, Accept-Encoding");
  expect(body).toBe(
    "dollarpe by @cristianbgp\n\nGET /exchanges\nGET /exchanges?sort=buy|sell\n\nGET /official-rate\nGET /official-rate?date=YYYY-MM-DD\n\nGET /openapi.json\nGET /docs\nGET /readme"
  );
});

test("GET / serves a concise Markdown index when the client prefers it", async () => {
  const response = await app.request("/", {
    headers: {
      Accept: "text/markdown, text/plain;q=0.5",
    },
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toBe(
    "text/markdown; charset=utf-8"
  );
  expect(response.headers.get("Vary")).toBe("Accept, Accept-Encoding");
  const body = await response.text();
  expect(body).toStartWith("# dollarpe by @cristianbgp");
  expect(body).toContain(
    "[GET /official-rate?date=YYYY-MM-DD](/official-rate?date=YYYY-MM-DD)"
  );
  expect(body).toContain("[GET /readme](/readme)");
  expect(body).not.toContain("## Development");
});

test("GET / respects q=0 and falls back to an acceptable representation", async () => {
  const response = await app.request("/", {
    headers: {
      Accept: "text/markdown;q=0, text/plain",
    },
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toContain("text/plain");
});

test("GET / treats a lone q=0 media type as an exclusion", async () => {
  const response = await app.request("/", {
    headers: {
      Accept: "text/markdown;q=0",
    },
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toContain("text/plain");
});

test("GET / returns 406 when every supported representation has q=0", async () => {
  const response = await app.request("/", {
    headers: {
      Accept: "text/markdown;q=0, text/plain;q=0",
    },
  });

  expect(response.status).toBe(406);
});

test("GET / treats quality parameter names case-insensitively", async () => {
  const response = await app.request("/", {
    headers: {
      Accept: "text/markdown;Q=0",
    },
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toContain("text/plain");
});

test("GET / rejects incompatible media parameters before choosing Markdown", async () => {
  const response = await app.request("/", {
    headers: {
      Accept: "text/markdown;charset=iso-8859-1, text/plain;q=0.5",
    },
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toContain("text/plain");
});

test("GET / ignores Accept extensions declared after the quality value", async () => {
  const response = await app.request("/", {
    headers: {
      Accept: "text/markdown;q=0.9;level=1, text/plain;q=0.5",
    },
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toBe(
    "text/markdown; charset=utf-8"
  );
});

test("GET / uses plain text for a browser Accept header through its wildcard", async () => {
  const response = await app.request("/", {
    headers: {
      Accept: "text/html, application/xhtml+xml;q=0.9, */*;q=0.8",
    },
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toContain("text/plain");
});

test("GET / returns 406 when no text representation is acceptable", async () => {
  const response = await app.request("/", {
    headers: {
      Accept: "text/html",
    },
  });

  expect(response.status).toBe(406);
  expect(response.headers.get("Vary")).toBe("Accept, Accept-Encoding");
});

test("GET /readme serves the exact README.md source as Markdown", async () => {
  const response = await app.request("/readme");
  const readme = await Bun.file(
    new URL("../README.md", import.meta.url)
  ).text();

  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toBe(
    "text/markdown; charset=utf-8"
  );
  expect(await response.text()).toBe(readme);
});

test("unknown routes return a recoverable Markdown 404", async () => {
  const response = await app.request("/this-path-does-not-exist");
  const body = await response.text();

  expect(response.status).toBe(404);
  expect(response.headers.get("Content-Type")).toBe(
    "text/markdown; charset=utf-8"
  );
  expect(body).toStartWith("# Not Found");
  expect(body).toContain("[/readme](/readme)");
  expect(body).toContain("[/docs](/docs)");
  expect(body).toContain("[/openapi.json](/openapi.json)");
});

test("unknown routes return a structured JSON 404 when requested", async () => {
  const response = await app.request("/this-path-does-not-exist", {
    headers: { Accept: "application/json" },
  });

  expect(response.status).toBe(404);
  expect(response.headers.get("Content-Type")).toContain("application/json");
  expect(await response.json()).toEqual({
    error: "The requested resource was not found",
    code: "NOT_FOUND",
    message: "The requested resource was not found",
    hint: "Use /readme, /docs, or /openapi.json to find a public endpoint.",
  });
});

test("unknown routes return 406 when every recovery format is rejected", async () => {
  const response = await app.request("/this-path-does-not-exist", {
    headers: {
      Accept: "application/json;q=0, text/markdown;q=0",
    },
  });

  expect(response.status).toBe(406);
  expect(response.headers.get("Vary")).toBe("Accept, Accept-Encoding");
});

describe("OpenAPI documentation", () => {
  test("describes every public API route and query parameter", async () => {
    const response = await app.request("/openapi.json");

    expect(response.status).toBe(200);
    const document = (await response.json()) as {
      openapi: string;
      components: {
        schemas: Record<
          string,
          {
            properties?: Record<string, unknown>;
            required?: string[];
          }
        >;
      };
      paths: Record<
        string,
        {
          get?: {
            operationId?: string;
            description?: string;
            parameters?: Array<{
              name: string;
              in: string;
              required: boolean;
              schema: Record<string, unknown>;
            }>;
            responses: Record<string, unknown>;
          };
        }
      >;
    };

    expect(document.openapi).toBe("3.1.0");
    expect(Object.keys(document.paths).sort()).toEqual([
      "/exchanges",
      "/official-rate",
    ]);

    const exchanges = document.paths["/exchanges"].get!;
    expect(exchanges.operationId).toBe("listExchangeRates");
    expect(exchanges.description?.length).toBeGreaterThan(0);
    expect(
      exchanges.parameters?.find((parameter) => parameter.name === "sort")
    ).toMatchObject({
      name: "sort",
      in: "query",
      required: false,
      schema: { type: "string", enum: ["buy", "sell"] },
    });
    expect(Object.keys(exchanges.responses).sort()).toEqual([
      "200",
      "400",
      "503",
    ]);

    const officialRate = document.paths["/official-rate"].get!;
    expect(officialRate.operationId).toBe("getOfficialRate");
    expect(officialRate.description?.length).toBeGreaterThan(0);
    expect(
      officialRate.parameters?.find((parameter) => parameter.name === "date")
    ).toMatchObject({
      name: "date",
      in: "query",
      required: false,
      schema: { type: "string", format: "date" },
    });
    expect(Object.keys(officialRate.responses).sort()).toEqual([
      "200",
      "400",
      "503",
    ]);

    const operationIds = Object.values(document.paths).flatMap(({ get }) =>
      get?.operationId ? [get.operationId] : []
    );
    expect(new Set(operationIds).size).toBe(operationIds.length);
    expect(document.components.schemas.Error.required?.sort()).toEqual([
      "code",
      "error",
      "hint",
      "message",
    ]);
    expect(
      Object.keys(document.components.schemas.Error.properties ?? {}).sort()
    ).toEqual(["code", "error", "hint", "message"]);
  });

  test("serves an interactive Swagger UI", async () => {
    const response = await app.request("/docs");
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(body.toLowerCase()).toContain("swagger");
    expect(body).toContain("/openapi.json");
  });
});

describe("GET /exchanges upstream isolation", () => {
  test("returns a structured 400 error for an invalid sort", async () => {
    const response = await app.request("/exchanges?sort=unknown");

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Invalid sort criteria",
      code: "INVALID_SORT",
      message: "Invalid sort criteria",
      hint: "Use sort=buy or sort=sell.",
    });
  });

  test("returns 503 when every provider fails", async () => {
    useFetch(async () => {
      throw new Error("Provider unavailable in test");
    });

    const response = await app.request("/exchanges");

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBeNull();
    expect(await response.json()).toEqual({
      error: "Exchange rates are temporarily unavailable",
      code: "EXCHANGE_RATES_UNAVAILABLE",
      message: "Exchange rates are temporarily unavailable",
      hint: "Retry later; upstream providers may be temporarily unavailable.",
    });
  });

  test("omits an upstream response with a failing HTTP status", async () => {
    useFetch(async (input) => {
      const url = String(input);

      if (url.includes("rextie")) {
        return jsonResponse(rextieResponse);
      }

      if (url.includes("kambista")) {
        return jsonResponse(kambistaResponse, 500);
      }

      throw new Error("Provider unavailable in test");
    });

    const response = await app.request("/exchanges");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      [
        "rextie",
        {
          buy: 3.33,
          sell: 3.36,
          pageUrl: "https://www.rextie.com/",
        },
      ],
    ]);
  });

  test("omits malformed rates without failing valid providers", async () => {
    useFetch(async (input) => {
      const url = String(input);

      if (url.includes("rextie")) {
        return jsonResponse(rextieResponse);
      }

      if (url.includes("kambista")) {
        return jsonResponse({ tc: {} });
      }

      throw new Error("Provider unavailable in test");
    });

    const response = await app.request("/exchanges");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      [
        "rextie",
        {
          buy: 3.33,
          sell: 3.36,
          pageUrl: "https://www.rextie.com/",
        },
      ],
    ]);
  });

  test(
    "omits a provider that exceeds the request timeout",
    async () => {
      useFetch(async (input, init) => {
        const url = String(input);

        if (url.includes("rextie")) {
          return jsonResponse(rextieResponse);
        }

        if (url.includes("kambista")) {
          return new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener(
              "abort",
              () => reject(init.signal?.reason),
              { once: true }
            );
          });
        }

        throw new Error("Provider unavailable in test");
      });

      const response = await app.request("/exchanges");

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual([
        [
          "rextie",
          {
            buy: 3.33,
            sell: 3.36,
            pageUrl: "https://www.rextie.com/",
          },
        ],
      ]);
    },
    6_000
  );
});

describe("GET /exchanges sorting", () => {
  const useTwoValidProviders = () => {
    useFetch(async (input) => {
      const url = String(input);

      if (url.includes("rextie")) {
        return jsonResponse({
          fx_rate_buy: "3.33",
          fx_rate_sell: "3.38",
        });
      }

      if (url.includes("kambista")) {
        return jsonResponse(kambistaResponse);
      }

      throw new Error("Provider unavailable in test");
    });
  };

  test("sorts buy rates from highest to lowest", async () => {
    useTwoValidProviders();

    const response = await app.request("/exchanges?sort=buy");
    const result = (await response.json()) as Array<[string, unknown]>;

    expect(response.status).toBe(200);
    expect(result.map(([provider]) => provider)).toEqual([
      "rextie",
      "kambista",
    ]);
  });

  test("sorts sell rates from lowest to highest", async () => {
    useTwoValidProviders();

    const response = await app.request("/exchanges?sort=sell");
    const result = (await response.json()) as Array<[string, unknown]>;

    expect(response.status).toBe(200);
    expect(result.map(([provider]) => provider)).toEqual([
      "kambista",
      "rextie",
    ]);
  });
});

describe("GET /official-rate", () => {
  test("returns the official SUNAT exchange rate", async () => {
    useFetch(async () =>
      jsonResponse([
        { fecPublica: "01/01/2000", valTipo: "3.340", codTipo: "C" },
        { fecPublica: "01/01/2000", valTipo: "3.348", codTipo: "V" },
      ])
    );

    const response = await app.request("/official-rate");

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    expect(await response.json()).toEqual({
      source: "sunat",
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      buy: 3.34,
      sell: 3.348,
      pageUrl: "https://e-consulta.sunat.gob.pe/cl-at-ittipcam/tcS01Alias",
    });
  });

  test("queries the SUNAT month for the requested date", async () => {
    let requestBody: unknown;
    useFetch(async (_input, init) => {
      requestBody = JSON.parse(String(init?.body));
      return jsonResponse([
        { fecPublica: "14/11/2025", valTipo: "3.360", codTipo: "C" },
        { fecPublica: "14/11/2025", valTipo: "3.370", codTipo: "V" },
        { fecPublica: "17/11/2025", valTipo: "3.365", codTipo: "C" },
        { fecPublica: "17/11/2025", valTipo: "3.374", codTipo: "V" },
        { fecPublica: "20/11/2025", valTipo: "3.400", codTipo: "C" },
        { fecPublica: "20/11/2025", valTipo: "3.410", codTipo: "V" },
      ]);
    });

    const response = await app.request("/official-rate?date=2025-11-17");

    expect(response.status).toBe(200);
    expect(requestBody).toEqual({ anio: 2025, mes: 10, token: "x" });
    expect(await response.json()).toEqual({
      source: "sunat",
      date: "2025-11-17",
      buy: 3.365,
      sell: 3.374,
      pageUrl: "https://e-consulta.sunat.gob.pe/cl-at-ittipcam/tcS01Alias",
    });
  });

  test("rejects an impossible calendar date", async () => {
    useFetch(async () => {
      throw new Error("fetch must not be called for an invalid date");
    });

    const response = await app.request("/official-rate?date=2025-02-30");

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Invalid date",
      code: "INVALID_DATE",
      message: "Invalid date",
      hint: "Use a real, non-future date in YYYY-MM-DD format.",
    });
  });

  test("rejects a future date", async () => {
    useFetch(async () => {
      throw new Error("fetch must not be called for a future date");
    });

    const response = await app.request("/official-rate?date=2999-01-01");

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Invalid date",
      code: "INVALID_DATE",
      message: "Invalid date",
      hint: "Use a real, non-future date in YYYY-MM-DD format.",
    });
  });

  test("returns 503 when SUNAT is unavailable", async () => {
    useFetch(async () => {
      throw new Error("SUNAT unavailable in test");
    });

    const response = await app.request("/official-rate");

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBeNull();
    expect(await response.json()).toEqual({
      error: "Official exchange rate is temporarily unavailable",
      code: "OFFICIAL_RATE_UNAVAILABLE",
      message: "Official exchange rate is temporarily unavailable",
      hint: "Retry later or request a different historical date.",
    });
  });
});
