import { defineProvider } from "./fetch-provider";

const PUBLIC_SUBSCRIPTION_KEY =
  "e4b6947d96a940e7bb8b39f462bcc56d;product=tucambista-production";

type TuCambistaResponse = {
  bidRate: number;
  offerRate: number;
};

export const tucambistaProvider = defineProvider<TuCambistaResponse>({
  name: "tucambista",
  url: "https://apim.tucambista.pe/api/rates",
  pageUrl: "https://tucambista.pe/",
  cacheTtlSeconds: 60,
  request: {
    headers: {
      "Ocp-Apim-Subscription-Key": PUBLIC_SUBSCRIPTION_KEY,
    },
  },
  parse: (response) => ({
    buy: response.bidRate,
    sell: response.offerRate,
  }),
});
