import React from "react";
import { Box, Text } from "ink";
import Link from "ink-link";
import useSWR from "swr";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./error-fallback.js";
import {
  getOfficialRate,
  listExchangeRates,
  type OfficialRate,
  type ListExchangeRatesParams,
  type listExchangeRatesResponseSuccess,
} from "./generated/dollarpe.js";
import Loader from "./loader.js";

export type Sort = NonNullable<ListExchangeRatesParams["sort"]>;
export type ResponseData = listExchangeRatesResponseSuccess["data"];
export type Command = "exchanges" | "official-rate";

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

export function OfficialRateView({ data }: { data: OfficialRate }) {
  return (
    <Box flexDirection="column">
      <Text color="red">official rate</Text>
      <Link url={data.pageUrl}>
        <Text>source: {data.source}</Text>
      </Link>
      <Text>date: {data.date}</Text>
      <Text color="blue">buy: {data.buy}</Text>
      <Text color="blue">sell: {data.sell}</Text>
    </Box>
  );
}

function OfficialRateWrapper({ date }: { date?: string }) {
  const { data, error, isLoading } = useSWR<OfficialRate>(
    ["official-rate", date],
    async () => (await getOfficialRate({ date })).data,
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  return data ? <OfficialRateView data={data} /> : null;
}

export default function App({
  command = "exchanges",
  sort = "buy",
  date,
}: {
  command?: string;
  sort?: Sort;
  date?: string;
}) {
  if (command !== "exchanges" && command !== "official-rate") {
    return (
      <Box flexDirection="column">
        <Text color="red">
          Invalid command. Use 'exchanges' or 'official-rate'.
        </Text>
      </Box>
    );
  }

  if (command === "exchanges" && sort !== "buy" && sort !== "sell") {
    return (
      <Box flexDirection="column">
        <Text color="red">Invalid sort option. Use 'buy' or 'sell'.</Text>
      </Box>
    );
  }

  if (command === "official-rate") {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <OfficialRateWrapper date={date} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Wrapper sort={sort} />
    </ErrorBoundary>
  );
}
