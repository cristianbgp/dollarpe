# dollarpe web

The public [dollarpe website](https://dollarpe.cristianbgp.com) presents current
US dollar to Peruvian sol exchange rates in a terminal-inspired interface.

The application is built with SolidStart and reads the public
[dollarpe API](https://dollarpe-api.cristianbgp.com/exchanges). The same data is
available from the command line:

```sh
dollarpe exchanges
dollarpe official-rate
```

## Development

```sh
bun install --frozen-lockfile
bun run dev
```
