import { defineProvider } from "./fetch-provider";

type TKambioResponse = {
  buying_rate: string | number;
  selling_rate: string | number;
};

export const tkambioProvider = defineProvider<TKambioResponse>({
  name: "tkambio",
  url: "https://tkambio.com/wp-admin/admin-ajax.php",
  pageUrl: "https://tkambio.com/",
  cacheTtlSeconds: 60,
  request: {
    method: "POST",
    body: "action=get_exchange_rate",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  },
  parse: (response) => ({
    buy: Number(response.buying_rate),
    sell: Number(response.selling_rate),
  }),
});
