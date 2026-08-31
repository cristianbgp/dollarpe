import { cambiomundialProvider } from "./cambiomundial";
import { chapacambioProvider } from "./chapacambio";
import { decamoneyProvider } from "./decamoney";
import { kambistaProvider } from "./kambista";
import { rextieProvider } from "./rextie";
import { roblexProvider } from "./roblex";
import { sunatProvider } from "./sunat";
import { tkambioProvider } from "./tkambio";
import { tucambistaProvider } from "./tucambista";

export const providers = [
  rextieProvider,
  kambistaProvider,
  tkambioProvider,
  roblexProvider,
  decamoneyProvider,
  tucambistaProvider,
  chapacambioProvider,
  cambiomundialProvider,
  sunatProvider,
];

export type { DataResult, ExchangeProvider, ProviderName } from "./types";
