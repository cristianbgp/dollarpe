import { providers } from "./providers";
import type { DataResult, ProviderName } from "./providers";
import { ProviderRequestError } from "./providers/fetch-provider";
import sortCriteriaGenerator from "./utils/sort-criteria-generator";

export type ExchangeSort = "buy" | "sell";
export type DataEntry = [ProviderName, DataResult];

const buyCriteriaDesc = sortCriteriaGenerator<DataEntry>(
  ([, item]) => item.buy,
  { desc: true },
);
const sellCriteriaDesc = sortCriteriaGenerator<DataEntry>(
  ([, item]) => item.sell,
  { asc: true },
);

export async function getAllData(
  sort: ExchangeSort = "buy",
): Promise<DataEntry[]> {
  const settledRates = await Promise.allSettled(
    providers.map(async (provider) => {
      const startedAt = Date.now();

      try {
        return await provider.fetchRate();
      } catch (error) {
        console.error({
          event: "provider_fetch_failed",
          provider: provider.name,
          ...(error instanceof ProviderRequestError &&
          error.status !== undefined
            ? { status: error.status }
            : {}),
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }),
  );

  const rates = settledRates.flatMap((result, index): DataEntry[] => {
    if (result.status === "rejected") {
      return [];
    }

    return [[providers[index].name, result.value]];
  });

  const sortCriteria = sort === "buy" ? buyCriteriaDesc : sellCriteriaDesc;
  return rates.sort(sortCriteria);
}
