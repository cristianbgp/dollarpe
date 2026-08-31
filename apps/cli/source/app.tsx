import React from "react";
import { Box, Text } from "ink";
import Link from "ink-link";
import useSWR from "swr";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./error-fallback.js";
import {
  listExchangeRates,
  type ListExchangeRatesParams,
  type listExchangeRatesResponseSuccess,
} from "./generated/dollarpe.js";
import Loader from "./loader.js";

export type Sort = NonNullable<ListExchangeRatesParams["sort"]>;
export type ResponseData = listExchangeRatesResponseSuccess["data"];

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
  const { data, error, isLoading } = useSWR<ResponseData>(
    ["exchange-rates", sort],
    async () => (await listExchangeRates({ sort })).data,
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
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
