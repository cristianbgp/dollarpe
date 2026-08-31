import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createApiError,
  negotiateContentType,
  setNegotiatedResponseHeaders,
} from "../http";

export function registerNotFound(app: OpenAPIHono): void {
  app.notFound((c) => {
    setNegotiatedResponseHeaders(c);
    const contentType = negotiateContentType(
      c,
      ["text/markdown", "application/json"],
      "text/markdown",
    );

    if (contentType === "application/json") {
      return c.json(
        createApiError(
          "NOT_FOUND",
          "The requested resource was not found",
          "Use /readme, /docs, or /openapi.json to find a public endpoint.",
        ),
        404,
      );
    }

    if (contentType === "not-acceptable") {
      return c.text(
        "Not Acceptable. Request text/markdown or application/json.",
        406,
      );
    }

    c.header("Content-Type", "text/markdown; charset=utf-8");
    return c.body(
      "# Not Found\n\nThe requested resource does not exist. Continue with [/readme](/readme), [/docs](/docs), or the machine-readable [/openapi.json](/openapi.json).\n",
      404,
    );
  });
}
