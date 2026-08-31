import { swaggerUI } from "@hono/swagger-ui";
import type { OpenAPIHono } from "@hono/zod-openapi";
import readme from "../../README.md" with { type: "text" };
import {
  negotiateContentType,
  setNegotiatedResponseHeaders,
} from "../http";

const indexText =
  "dollarpe by @cristianbgp\n\nGET /exchanges\nGET /exchanges?sort=buy|sell\n\nGET /official-rate\nGET /official-rate?date=YYYY-MM-DD\n\nGET /openapi.json\nGET /docs\nGET /readme";

const indexMarkdown = `# dollarpe by @cristianbgp

- [GET /exchanges](/exchanges)
- [GET /exchanges?sort=buy](/exchanges?sort=buy)
- [GET /exchanges?sort=sell](/exchanges?sort=sell)
- [GET /official-rate](/official-rate)
- [GET /official-rate?date=YYYY-MM-DD](/official-rate?date=YYYY-MM-DD)
- [GET /openapi.json](/openapi.json)
- [GET /docs](/docs)
- [GET /readme](/readme)
`;

export function registerDiscoveryRoutes(app: OpenAPIHono): void {
  app.get("/", (c) => {
    setNegotiatedResponseHeaders(c);
    const contentType = negotiateContentType(
      c,
      ["text/plain", "text/markdown"],
      "text/plain"
    );

    if (contentType === "not-acceptable") {
      return c.text(
        "Not Acceptable. Request text/plain or text/markdown.",
        406
      );
    }

    c.header("Content-Type", `${contentType}; charset=utf-8`);
    return c.body(contentType === "text/markdown" ? indexMarkdown : indexText);
  });

  app.get("/readme", (c) => {
    c.header("Content-Type", "text/markdown; charset=utf-8");
    return c.body(readme);
  });

  app.doc31("/openapi.json", {
    openapi: "3.1.0",
    info: {
      title: "dollarpe API",
      version: "1.0.0",
      description:
        "US dollar to Peruvian sol exchange rates from online providers and SUNAT.",
    },
  });

  app.get("/docs", swaggerUI({ url: "/openapi.json" }));
}
