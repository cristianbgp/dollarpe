import { defineProvider } from "./fetch-provider";

type CambioMundialRate = {
  idTasaCambio: number;
  buy: number;
  sell: number;
  tipoTasa: "REGULAR" | "DIFERENCIADA";
  fecha: string;
  createdAt: string;
  updatedAt: string;
};

type CambioMundialResponse = CambioMundialRate[];

export const cambiomundialProvider = defineProvider<CambioMundialResponse>({
  name: "cambiomundial",
  url: "https://www.cambiomundial.com/backend/tasaCambio/daily",
  pageUrl: "https://www.cambiomundial.com",
  cacheTtlSeconds: 300,
  parse: (response) => {
    const regularRate = response.find(({ tipoTasa }) => tipoTasa === "REGULAR");

    return {
      buy: regularRate?.buy ?? Number.NaN,
      sell: regularRate?.sell ?? Number.NaN,
    };
  },
});
