import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { createApiError } from "../http";
import {
  fetchSunatOfficialRate,
  InvalidSunatDateError,
} from "../providers/sunat";
import { DataResultSchema, errorResponse } from "./schemas";

const OfficialRateSchema = DataResultSchema.extend({
  source: z.literal("sunat"),
  date: z.iso.date(),
}).openapi("OfficialRate");

const officialRateRoute = createRoute({
  method: "get",
  path: "/official-rate",
  operationId: "getOfficialRate",
  tags: ["Official rate"],
  summary: "Get the official SUNAT exchange rate",
  description:
    "Returns the official rate for today in Lima or for a requested historical date.",
  request: {
    query: z.object({
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .openapi({
          param: { name: "date", in: "query" },
          description:
            "Historical date in YYYY-MM-DD format. Future dates are rejected.",
          format: "date",
          example: "2025-11-17",
        }),
    }),
  },
  responses: {
    200: {
      description: "Official SUNAT exchange rate",
      content: {
        "application/json": {
          schema: OfficialRateSchema,
        },
      },
    },
    400: errorResponse("Invalid or future date"),
    503: errorResponse("SUNAT is temporarily unavailable"),
  },
});

export function registerOfficialRateRoutes(app: OpenAPIHono): void {
  app.openapi(
    officialRateRoute,
    async (c) => {
      try {
        const { date } = c.req.valid("query");
        const rate = await fetchSunatOfficialRate(date);

        c.header(
          "Cache-Control",
          "public, s-maxage=3600, stale-while-revalidate=86400"
        );
        return c.json(rate, 200);
      } catch (error) {
        if (error instanceof InvalidSunatDateError) {
          return c.json(
            createApiError(
              "INVALID_DATE",
              error.message,
              "Use a real, non-future date in YYYY-MM-DD format."
            ),
            400
          );
        }

        console.error({
          event: "official_rate_fetch_failed",
          provider: "sunat",
          error: error instanceof Error ? error.message : String(error),
        });
        return c.json(
          createApiError(
            "OFFICIAL_RATE_UNAVAILABLE",
            "Official exchange rate is temporarily unavailable",
            "Retry later or request a different historical date."
          ),
          503
        );
      }
    },
    (result, c) => {
      if (!result.success) {
        return c.json(
          createApiError(
            "INVALID_DATE",
            "Invalid date",
            "Use a real, non-future date in YYYY-MM-DD format."
          ),
          400
        );
      }
    }
  );
}
