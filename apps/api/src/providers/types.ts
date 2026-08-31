export const providerNames = [
  "rextie",
  "kambista",
  "tkambio",
  "roblex",
  "decamoney",
  "tucambista",
  "chapacambio",
  "cambiomundial",
  "sunat",
] as const;

export type ProviderName = (typeof providerNames)[number];

export type DataResult = {
  buy: number;
  sell: number;
  pageUrl: string;
};

export type ExchangeProvider = {
  name: ProviderName;
  fetchRate: () => Promise<DataResult>;
};

export type ProviderDefinition<TResponse> = {
  name: ProviderName;
  url: string;
  pageUrl: string;
  request?: Omit<RequestInit, "signal">;
  cacheTtlSeconds: number;
  parse: (response: TResponse) => Pick<DataResult, "buy" | "sell">;
};
