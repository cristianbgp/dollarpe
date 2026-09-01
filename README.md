# dollarpe

dollarpe provides tools for checking the US dollar to Peruvian sol exchange rate.

This repository is being organized as a lightweight monorepo. Each application owns its dependencies, lockfile, build, and release process; the root package only coordinates common commands.

## Applications

| Application            | Description                                   |
| ---------------------- | --------------------------------------------- |
| [`apps/api`](apps/api) | Public Hono and Cloudflare Workers API        |
| [`apps/cli`](apps/cli) | Published `dollarpe` command-line application |
| [`apps/web`](apps/web) | Public SolidStart website                     |

## Deployments

| Service           | URL                                                                            |
| ----------------- | ------------------------------------------------------------------------------ |
| Web               | [dollarpe.cristianbgp.com](https://dollarpe.cristianbgp.com)                   |
| API               | [dollarpe-api.cristianbgp.com](https://dollarpe-api.cristianbgp.com)           |
| API documentation | [dollarpe-api.cristianbgp.com/docs](https://dollarpe-api.cristianbgp.com/docs) |
| CLI package       | [npmjs.com/package/dollarpe](https://www.npmjs.com/package/dollarpe)           |

## Development

Install application dependencies:

```sh
bun run install:apps
```

Format or check formatting across the repository:

```sh
bun run format
bun run format:check
```

Run an application in development:

```sh
bun run dev:cli
bun run dev:api
bun run dev:web
```

Build the CLI and website:

```sh
bun run build
```

Build the CLI and website, then run the API typecheck and tests:

```sh
bun run check
```

Targeted API validation is also available:

```sh
bun run test:api
bun run typecheck:api
bun run check:api
```

Application-specific commands can also be run directly from `apps/cli`, `apps/api`, or `apps/web`.

## CLI usage

Install the published command globally:

```sh
npm install --global dollarpe
```

List current exchange rates from every provider:

```sh
dollarpe exchanges
dollarpe exchanges --sort=sell
```

Get today's official SUNAT rate or request a historical date:

```sh
dollarpe official-rate
dollarpe official-rate --date=2025-11-17
```

Running `dollarpe` without a command remains an alias for `dollarpe exchanges`.
