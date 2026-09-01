#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import App from "./app.js";
import meow from "meow";

const cli = meow(
  `
Usage
$ dollarpe
$ dollarpe exchanges
$ dollarpe official-rate

Options
--sort  buy | sell
--date  YYYY-MM-DD

Examples
$ dollarpe exchanges --sort=buy
$ dollarpe exchanges --sort=sell
$ dollarpe official-rate
$ dollarpe official-rate --date=2025-11-17
`,
  {
    importMeta: import.meta,
    flags: {
      sort: {
        type: "string",
        alias: "s",
      },
      date: {
        type: "string",
        alias: "d",
      },
      help: {
        alias: "h",
      },
      version: {
        alias: "v",
      },
    },
  },
);

render(
  <App
    command={cli.input[0] ?? "exchanges"}
    sort={cli.flags.sort as "buy" | "sell"}
    date={cli.flags.date}
  />,
);
