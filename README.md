# dollarpe

dollarpe provides tools for checking the US dollar to Peruvian sol exchange rate.

This repository is being organized as a lightweight monorepo. Each application owns its dependencies, lockfile, build, and release process; the root package only coordinates common commands.

## Applications

| Application | Description |
| --- | --- |
| [`apps/api`](apps/api) | Public Hono and Cloudflare Workers API |
| [`apps/cli`](apps/cli) | Published `dollarpe` command-line application |

The public website will be added as an independent application in a later migration phase.

## Development

Install application dependencies:

```sh
bun run install:apps
```

Run an application in development:

```sh
bun run dev:cli
bun run dev:api
```

Build the CLI:

```sh
bun run build
```

Check the CLI build and the API typecheck and tests:

```sh
bun run check
```

Targeted API validation is also available:

```sh
bun run test:api
bun run typecheck:api
bun run check:api
```

Application-specific commands can also be run directly from `apps/cli` or `apps/api`.
