import React from "react";
import { Box, Text } from "ink";
import Link from "ink-link";
import useSWR from "swr";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./error-fallback.js";
import Loader from "./loader.js";

const DOLLARPE_API = "https://dollarpe-api.cristianbgp.com/exchanges";

function Item({
	name,
	buy,
	sell,
	isFirst,
	pageUrl,
	sort,
}: {
	name: string;
	buy: string;
	sell: string;
	isFirst: boolean;
	pageUrl: string;
	sort: "buy" | "sell";
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

type ResponseData = [string, { buy: string; sell: string; pageUrl: string }][];

function Wrapper({ sort }: { sort: "buy" | "sell" }) {
	const { data, isLoading } = useSWR<ResponseData>(
		`${DOLLARPE_API}?sort=${sort}`,
		fetcher
	);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<Box flexDirection="column">
			{(data || []).map(([name, { buy, sell, pageUrl }], index) => (
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

export default function App({ sort = "buy" }: { sort: "buy" | "sell" }) {
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
