import { z } from "@hono/zod-openapi";

export const ErrorSchema = z
  .object({
    error: z.string().openapi({
      description: "Backward-compatible copy of the human-readable message.",
      example: "Invalid sort criteria",
    }),
    code: z.string().openapi({
      description: "Stable machine-readable error code.",
      example: "INVALID_SORT",
    }),
    message: z.string().openapi({
      description: "Human-readable explanation of the error.",
      example: "Invalid sort criteria",
    }),
    hint: z.string().openapi({
      description: "A concrete action the client can take to recover.",
      example: "Use sort=buy or sort=sell.",
    }),
  })
  .openapi("Error");

export const DataResultSchema = z
  .object({
    buy: z.number().positive(),
    sell: z.number().positive(),
    pageUrl: z.url(),
  })
  .openapi("ExchangeRate");

export const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: ErrorSchema,
    },
  },
});
