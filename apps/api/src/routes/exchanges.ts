import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { getAllData } from "../exchanges";
import { createApiError } from "../http";
import { providerNames } from "../providers/types";
import { DataResultSchema, errorResponse } from "./schemas";

const ExchangeEntrySchema = z.tuple([
  z.enum(providerNames).openapi("ProviderName"),
  DataResultSchema,
]);

const exchangesRoute = createRoute({
  method: "get",
  path: "/exchanges",
  operationId: "listExchangeRates",
  tags: ["Exchange rates"],
  summary: "List current exchange rates",
  description:
    "Returns every available provider. Providers that fail or return invalid data are omitted.",
  request: {
    query: z.object({
      sort: z
        .enum(["buy", "sell"])
        .optional()
        .openapi({
          param: { name: "sort", in: "query" },
          description:
            "Sort by highest buy rate or lowest sell rate. Defaults to buy.",
          example: "buy",
        }),
    }),
  },
  responses: {
    200: {
      description: "Available exchange rates",
      content: {
        "application/json": {
          schema: z.array(ExchangeEntrySchema),
        },
      },
    },
    400: errorResponse("Invalid sort criteria"),
    503: errorResponse("Every exchange-rate provider is unavailable"),
  },
});

export function registerExchangeRoutes(app: OpenAPIHono): void {
  app.openapi(
    exchangesRoute,
    async (c) => {
      const { sort = "buy" } = c.req.valid("query");
      const result = await getAllData(sort);

      if (result.length === 0) {
        return c.json(
          createApiError(
            "EXCHANGE_RATES_UNAVAILABLE",
            "Exchange rates are temporarily unavailable",
            "Retry later; upstream providers may be temporarily unavailable.",
          ),
          503,
        );
      }

      c.header(
        "Cache-Control",
        "public, s-maxage=60, stale-while-revalidate=30",
      );
      return c.json(result, 200);
    },
    (result, c) => {
      if (!result.success) {
        return c.json(
          createApiError(
            "INVALID_SORT",
            "Invalid sort criteria",
            "Use sort=buy or sort=sell.",
          ),
          400,
        );
      }
    },
  );
}
