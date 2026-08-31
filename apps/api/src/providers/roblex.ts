import { defineProvider } from "./fetch-provider";

type RoblexResponse = {
  amountBuy: number;
  amountSale: number;
};

export const roblexProvider = defineProvider<RoblexResponse>({
  name: "roblex",
  url: "https://operations.roblex.pe/valuation/active-valuation",
  pageUrl: "https://roblex.pe/",
  cacheTtlSeconds: 60,
  parse: (response) => ({
    buy: response.amountBuy,
    sell: response.amountSale,
  }),
});
