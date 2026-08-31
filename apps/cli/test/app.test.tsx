import { describe, expect, test } from "bun:test";
import React from "react";
import { render } from "ink-testing-library";
import App, {
  ExchangeList,
  getExchangesUrl,
  type ResponseData,
  type Sort,
} from "../source/app.js";

const rates: ResponseData = [
  ["rextie", { buy: 3.34, sell: 3.37, pageUrl: "https://rextie.com" }],
  ["sunat", { buy: 3.33, sell: 3.38, pageUrl: "https://sunat.gob.pe" }],
];

describe("exchange-rate presentation", () => {
  test("builds sorted exchange URLs", () => {
    expect(getExchangesUrl("buy")).toBe(
      "https://dollarpe-api.cristianbgp.com/exchanges?sort=buy",
    );
    expect(getExchangesUrl("sell")).toBe(
      "https://dollarpe-api.cristianbgp.com/exchanges?sort=sell",
    );
  });

  test("renders every exchange rate", () => {
    const { lastFrame } = render(<ExchangeList data={rates} sort="buy" />);

    expect(lastFrame()).toContain("rextie");
    expect(lastFrame()).toContain("buy: 3.34");
    expect(lastFrame()).toContain("sell: 3.37");
    expect(lastFrame()).toContain("sunat");
  });

  test("renders the existing invalid-sort error", () => {
    const { lastFrame } = render(<App sort={"unknown" as Sort} />);

    expect(lastFrame()).toBe("Invalid sort option. Use 'buy' or 'sell'.");
  });
});
