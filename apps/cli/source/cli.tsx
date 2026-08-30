#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import App from "./app.js";
import meow from "meow";

const cli = meow(
`
Usage
$ dollarpe

Options
--sort  buy | sell

Examples
$ dollarpe --sort=buy
$ dollarpe --sort=sell
`,
	{
		importMeta: import.meta,
		flags: {
			sort: {
				type: "string",
				alias: "s",
			},
			help: {
				alias: "h",
			},
			version: {
				alias: "v",
			},
		},
	}
);

render(<App sort={cli.flags.sort as "buy" | "sell"} />);
