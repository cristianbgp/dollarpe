import { defineProvider } from "./fetch-provider";

type ChapaCambioResponse = [
  {
    MontoCompra: string | number;
    MontoVenta: string | number;
  },
];

export const chapacambioProvider = defineProvider<ChapaCambioResponse>({
  name: "chapacambio",
  url: "https://chapacambioscontingencia.blob.core.windows.net/config/tc.json",
  pageUrl: "https://chapacambio.com/",
  cacheTtlSeconds: 60,
  parse: ([response]) => ({
    buy: Number(response.MontoCompra),
    sell: Number(response.MontoVenta),
  }),
});
