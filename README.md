# dollarpe

dollarpe provides tools for checking the US dollar to Peruvian sol exchange rate.

This repository is being organized as a lightweight monorepo. Each application owns its dependencies, lockfile, build, and release process; the root package only coordinates common commands.

## Applications

| Application | Description |
| --- | --- |
| [`apps/cli`](apps/cli) | Published `dollarpe` command-line application |

The public API and website will be added as independent applications in later migration phases.

## Development

Install application dependencies:

```sh
bun run install:apps
```

Run the CLI in development:

```sh
bun run dev
```

Build the CLI:

```sh
bun run build
```

Application-specific commands can also be run directly from `apps/cli`.
