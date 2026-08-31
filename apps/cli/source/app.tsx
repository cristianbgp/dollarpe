import React from "react";
import { Box, Text } from "ink";
import Link from "ink-link";
import useSWR from "swr";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./error-fallback.js";
import Loader from "./loader.js";

const DOLLARPE_API = "https://dollarpe-api.cristianbgp.com/exchanges";

export type Sort = "buy" | "sell";

export type ExchangeRate = {
  buy: number;
  sell: number;
  pageUrl: string;
};

export type ResponseData = [string, ExchangeRate][];

export function getExchangesUrl(sort: Sort): string {
  return `${DOLLARPE_API}?sort=${sort}`;
}

function Item({
  name,
  buy,
  sell,
  isFirst,
  pageUrl,
  sort,
}: {
  name: string;
  buy: number;
  sell: number;
  isFirst: boolean;
  pageUrl: string;
  sort: Sort;
}) {
  return (
    <Box flexDirection="column">
      <Link url={pageUrl}>
        <Text color="red">{name}</Text>
      </Link>
      <Box flexDirection="column" marginLeft={2}>
        <Box justifyContent="flex-start">
          <Text color="blue">buy: </Text>
          <Text color={isFirst && sort === "buy" ? "green" : "white"}>
            {buy}
          </Text>
        </Box>
        <Box>
          <Text color="blue">sell: </Text>
          <Text color={isFirst && sort === "sell" ? "green" : "white"}>
            {sell}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

async function fetcher(url: string) {
  const res = await fetch(url);
  return (await res.json()) as ResponseData;
}

export function ExchangeList({
  data,
  sort,
}: {
  data: ResponseData;
  sort: Sort;
}) {
  return (
    <Box flexDirection="column">
      {data.map(([name, { buy, sell, pageUrl }], index) => (
        <Item
          key={name}
          name={name}
          buy={buy}
          sell={sell}
          pageUrl={pageUrl}
          isFirst={index === 0}
          sort={sort}
        />
      ))}
    </Box>
  );
}

function Wrapper({ sort }: { sort: Sort }) {
  const { data, isLoading } = useSWR<ResponseData>(
    getExchangesUrl(sort),
    fetcher,
  );

  if (isLoading) {
    return <Loader />;
  }

  return <ExchangeList data={data || []} sort={sort} />;
}

export default function App({ sort = "buy" }: { sort: Sort }) {
  if (sort !== "buy" && sort !== "sell") {
    return (
      <Box flexDirection="column">
        <Text color="red">Invalid sort option. Use 'buy' or 'sell'.</Text>
      </Box>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Wrapper sort={sort} />
    </ErrorBoundary>
  );
}
