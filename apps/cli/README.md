# dollarpe CLI

![npm](https://img.shields.io/npm/v/dollarpe?style=for-the-badge)

<div align="center">
  <img src="https://github.com/user-attachments/assets/f6e4860c-63b8-4bf5-a7c7-ddf5bacdd038" alt="dollarpe screenshot" />
</div>

Command-line interface for checking US dollar to Peruvian sol exchange rates.

It reads the public [dollarpe API](https://dollarpe-api.cristianbgp.com)
and supports current provider rates and official SUNAT rates, including
historical dates.

## Install

```sh
npm install --global dollarpe
```

## Usage

List the current rates from every provider:

```sh
dollarpe exchanges
```

Rates are sorted by the highest buy rate by default. Sort by the lowest sell
rate instead:

```sh
dollarpe exchanges --sort=sell
```

Get today's official SUNAT rate:

```sh
dollarpe official-rate
```

Request the official rate for a historical date:

```sh
dollarpe official-rate --date=2025-11-17
```

Dates must use the `YYYY-MM-DD` format and cannot be in the future. On weekends
and holidays, the API returns the latest available official rate.

For backward compatibility, `dollarpe` and `dollarpe --sort=buy|sell` continue
to run the `exchanges` command.

## Providers

The `exchanges` command currently includes Rextie, Kambista, TKambio, Roblex,
Decamoney, TuCambista, ChapaCambio, Cambio Mundial, and SUNAT.

## Development

```sh
bun install --frozen-lockfile
bun run dev -- exchanges
bun run check
```
