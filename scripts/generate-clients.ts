import { resolve } from "node:path";
import { generate, type OpenApiDocument, type Options } from "orval";
import app from "../apps/api/src/index";

const rootDirectory = resolve(import.meta.dir, "..");
const apiBaseUrl = "https://dollarpe-api.cristianbgp.com";

export const generatedClientPaths = [
  "apps/cli/source/generated/dollarpe.ts",
  "apps/web/src/generated/dollarpe.ts",
] as const;

export async function getOpenApiDocument(): Promise<OpenApiDocument> {
  const response = await app.request("/openapi.json");

  if (!response.ok) {
    throw new Error(
      `Could not load the local OpenAPI document: ${response.status}`,
    );
  }

  return (await response.json()) as OpenApiDocument;
}

function getClientOptions(
  document: OpenApiDocument,
  target: (typeof generatedClientPaths)[number],
): Options {
  return {
    input: { target: document },
    output: {
      target: resolve(rootDirectory, target),
      client: "fetch",
      mode: "single",
      clean: true,
      formatter: "prettier",
      baseUrl: apiBaseUrl,
      override: {
        fetch: {
          includeHttpResponseReturnType: true,
          forceSuccessResponse: true,
        },
      },
    },
  };
}

export async function generateClients(): Promise<void> {
  const document = await getOpenApiDocument();

  for (const target of generatedClientPaths) {
    await generate(getClientOptions(document, target));
  }
}

if (import.meta.main) {
  await generateClients();
}
