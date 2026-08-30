import React from "react";
import { Box, Text } from "ink";

export default function ErrorFallback() {
	return (
		<Box flexDirection="column">
			<Text color="red">Something went wrong ⚠️</Text>
			<Text color="red">Try again later</Text>
		</Box>
	);
}
