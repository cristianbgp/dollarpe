import { expect, test } from "bun:test";
import { getOpenApiDocument } from "./generate-clients";

test("loads the client contract from the local API application", async () => {
  const document = await getOpenApiDocument();

  expect(document.paths?.["/exchanges"]?.get?.operationId).toBe(
    "listExchangeRates",
  );
  expect(document.paths?.["/official-rate"]?.get?.operationId).toBe(
    "getOfficialRate",
  );
});
