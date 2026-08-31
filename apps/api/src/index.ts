import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { registerDiscoveryRoutes } from "./routes/discovery";
import { registerExchangeRoutes } from "./routes/exchanges";
import { registerNotFound } from "./routes/not-found";
import { registerOfficialRateRoutes } from "./routes/official-rate";

export type { DataResult } from "./providers";

const app = new OpenAPIHono();

app.use("*", cors());
registerDiscoveryRoutes(app);
registerExchangeRoutes(app);
registerOfficialRateRoutes(app);
registerNotFound(app);

export default app;
