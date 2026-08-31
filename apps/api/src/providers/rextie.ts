import { defineProvider } from "./fetch-provider";

type RextieResponse = {
  fx_rate_buy: string | number;
  fx_rate_sell: string | number;
};

export const rextieProvider = defineProvider<RextieResponse>({
  name: "rextie",
  url: "https://app.rextie.com/api/v1/fxrates/rate/",
  pageUrl: "https://www.rextie.com/",
  cacheTtlSeconds: 60,
  request: { method: "POST" },
  parse: (response) => ({
    buy: Number(response.fx_rate_buy),
    sell: Number(response.fx_rate_sell),
  }),
});
