import { expect, test } from "bun:test";
import {
  selectSunatRate,
  type SunatExchangeRateRow,
} from "./sunat";

const row = (
  fecPublica: string,
  valTipo: string,
  codTipo: "C" | "V"
): SunatExchangeRateRow => ({ fecPublica, valTipo, codTipo });

test("selects the complete SUNAT rate for the requested date", () => {
  expect(
    selectSunatRate(
      [
        row("27/08/2026", "3.339", "C"),
        row("27/08/2026", "3.350", "V"),
        row("28/08/2026", "3.340", "C"),
        row("28/08/2026", "3.348", "V"),
      ],
      "2026-08-28"
    )
  ).toEqual({ buy: 3.34, sell: 3.348 });
});

test("falls back to the latest complete rate before the requested date", () => {
  expect(
    selectSunatRate(
      [
        row("14/11/2025", "3.360", "C"),
        row("14/11/2025", "3.370", "V"),
        row("20/11/2025", "3.400", "C"),
        row("20/11/2025", "3.410", "V"),
      ],
      "2025-11-17"
    )
  ).toEqual({ buy: 3.36, sell: 3.37 });
});

test("ignores future, incomplete, and invalid rates", () => {
  expect(
    selectSunatRate(
      [
        row("16/11/2025", "3.350", "C"),
        row("16/11/2025", "3.360", "V"),
        row("17/11/2025", "invalid", "C"),
        row("17/11/2025", "3.370", "V"),
        row("18/11/2025", "3.400", "C"),
        row("18/11/2025", "3.410", "V"),
      ],
      "2025-11-17"
    )
  ).toEqual({ buy: 3.35, sell: 3.36 });
});

test("returns null when SUNAT has no complete applicable rate", () => {
  expect(
    selectSunatRate(
      [
        row("17/11/2025", "3.365", "C"),
        row("18/11/2025", "3.410", "V"),
      ],
      "2025-11-17"
    )
  ).toBeNull();
});
