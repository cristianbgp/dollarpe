/**
 * SUNAT exposes its official exchange-rate calendar through an internal JSON
 * endpoint used by the public website. This is not a documented public API, so
 * the provider deliberately behaves as a best-effort upstream dependency.
 * Failures propagate to the existing provider isolation logic.
 *
 * The endpoint accepts a year and a zero-based month, mirroring the JavaScript
 * month index used by SUNAT's website. It returns the complete month as
 * separate purchase (`C`) and sale (`V`) rows. We combine both rows and select
 * the latest complete rate on or before the requested date. Requests near the
 * beginning of a month may therefore need the previous month's data.
 *
 * Although the page obtains a reCAPTCHA token, the endpoint currently accepts
 * any non-empty token. SUNAT's WAF also requires browser-like headers. Either
 * behavior may change without notice, which is why this provider must never be
 * treated as a required dependency of `/exchanges`.
 */
import { ProviderRequestError } from "./fetch-provider";
import { withProviderCache } from "./cache";
import type { DataResult, ExchangeProvider } from "./types";

export type SunatExchangeRateRow = {
  fecPublica: string;
  valTipo: string;
  codTipo: "C" | "V";
};

type SunatRate = Pick<DataResult, "buy" | "sell">;

export type SunatOfficialRate = DataResult & {
  source: "sunat";
  date: string;
};

export class InvalidSunatDateError extends Error {
  constructor() {
    super("Invalid date");
    this.name = "InvalidSunatDateError";
  }
}

const PAGE_URL =
  "https://e-consulta.sunat.gob.pe/cl-at-ittipcam/tcS01Alias";
const ENDPOINT = `${PAGE_URL}/listarTipoCambio`;
const UPSTREAM_TIMEOUT_MS = 5_000;
const CACHE_TTL_SECONDS = 3_600;

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  Accept: "application/json, text/javascript, */*; q=0.01",
  "Accept-Language": "es-PE,es;q=0.9,en;q=0.8",
  // SUNAT's WAF rejects requests when this browser header is absent.
  "Accept-Encoding": "gzip, deflate, br",
  "Content-Type": "application/json; charset=utf-8",
  "X-Requested-With": "XMLHttpRequest",
  Referer: PAGE_URL,
  Origin: "https://e-consulta.sunat.gob.pe",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
};

function limaDateParts(date = new Date()): {
  year: number;
  month: number;
  isoDate: string;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  const year = Number(part("year"));
  const month = Number(part("month"));
  const day = part("day");

  return {
    year,
    month,
    isoDate: `${year}-${String(month).padStart(2, "0")}-${day}`,
  };
}

function toIsoDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

function isValidRequestedDate(value: string, today: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match || value > today) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function selectSunatRate(
  rows: SunatExchangeRateRow[],
  isoDate: string
): SunatRate | null {
  const ratesByDate = new Map<string, Partial<SunatRate>>();

  for (const row of rows) {
    const rowDate = toIsoDate(row.fecPublica);
    if (!rowDate || rowDate > isoDate) continue;

    const rate = Number(row.valTipo);
    if (!Number.isFinite(rate) || rate <= 0) continue;

    const rates = ratesByDate.get(rowDate) ?? {};
    if (row.codTipo === "C") rates.buy = rate;
    if (row.codTipo === "V") rates.sell = rate;
    ratesByDate.set(rowDate, rates);
  }

  const latestDate = [...ratesByDate.entries()]
    .filter(([, rate]) => rate.buy !== undefined && rate.sell !== undefined)
    .map(([date]) => date)
    .sort()
    .at(-1);

  if (!latestDate) return null;

  const rate = ratesByDate.get(latestDate);
  return { buy: rate!.buy!, sell: rate!.sell! };
}

async function fetchMonth(year: number, month: number) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    // SUNAT expects a zero-based month and currently only checks that the
    // reCAPTCHA token is non-empty.
    body: JSON.stringify({ anio: year, mes: month - 1, token: "x" }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new ProviderRequestError(
      `sunat request failed with status ${response.status}`,
      response.status
    );
  }

  const rows = (await response.json()) as unknown;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new ProviderRequestError("sunat returned no exchange rates");
  }

  return rows as SunatExchangeRateRow[];
}

export async function fetchSunatOfficialRate(
  requestedDate?: string
): Promise<SunatOfficialRate> {
  const today = limaDateParts().isoDate;
  const isoDate = requestedDate ?? today;
  if (!isValidRequestedDate(isoDate, today)) {
    throw new InvalidSunatDateError();
  }

  return withProviderCache({
    key: `sunat-${isoDate}`,
    ttlSeconds: CACHE_TTL_SECONDS,
    validate: (value): value is SunatOfficialRate => {
      if (!value || typeof value !== "object") return false;
      const rate = value as Partial<SunatOfficialRate>;

      return (
        rate.source === "sunat" &&
        rate.date === isoDate &&
        Number.isFinite(rate.buy) &&
        rate.buy! > 0 &&
        Number.isFinite(rate.sell) &&
        rate.sell! > 0 &&
        rate.pageUrl === PAGE_URL
      );
    },
    load: async () => {
      const [year, month] = isoDate.split("-").map(Number);
      let rows = await fetchMonth(year, month);
      let rate = selectSunatRate(rows, isoDate);

      if (!rate) {
        // The requested date can precede the first publication of its month.
        const previousMonth = month === 1 ? 12 : month - 1;
        const previousYear = month === 1 ? year - 1 : year;
        rows = await fetchMonth(previousYear, previousMonth);
        rate = selectSunatRate(rows, isoDate);
      }

      if (!rate) {
        throw new ProviderRequestError("sunat returned invalid exchange rates");
      }

      return {
        source: "sunat",
        date: isoDate,
        ...rate,
        pageUrl: PAGE_URL,
      };
    },
  });
}

export const sunatProvider: ExchangeProvider = {
  name: "sunat",
  async fetchRate(): Promise<DataResult> {
    const { buy, sell, pageUrl } = await fetchSunatOfficialRate();
    return { buy, sell, pageUrl };
  },
};
