import type { DataResult, ExchangeProvider, ProviderDefinition } from "./types";
import { withProviderCache } from "./cache";

const UPSTREAM_TIMEOUT_MS = 5_000;

export class ProviderRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ProviderRequestError";
  }
}

export function defineProvider<TResponse>({
  name,
  url,
  pageUrl,
  request,
  cacheTtlSeconds,
  parse,
}: ProviderDefinition<TResponse>): ExchangeProvider {
  const isDataResult = (value: unknown): value is DataResult => {
    if (!value || typeof value !== "object") return false;
    const result = value as Partial<DataResult>;

    return (
      Number.isFinite(result.buy) &&
      result.buy! > 0 &&
      Number.isFinite(result.sell) &&
      result.sell! > 0 &&
      result.pageUrl === pageUrl
    );
  };

  return {
    name,
    async fetchRate(): Promise<DataResult> {
      return withProviderCache({
        key: name,
        ttlSeconds: cacheTtlSeconds,
        validate: isDataResult,
        load: async () => {
          const response = await fetch(url, {
            ...request,
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
          });

          if (!response.ok) {
            throw new ProviderRequestError(
              `${name} request failed with status ${response.status}`,
              response.status,
            );
          }

          const rawRate = parse((await response.json()) as TResponse);
          const buy = Number(rawRate.buy);
          const sell = Number(rawRate.sell);

          if (
            !Number.isFinite(buy) ||
            buy <= 0 ||
            !Number.isFinite(sell) ||
            sell <= 0
          ) {
            throw new ProviderRequestError(
              `${name} returned invalid exchange rates`,
            );
          }

          return { buy, sell, pageUrl };
        },
      });
    },
  };
}
