# dollarpe-api

Get US dollar to Peruvian sol exchange rates from online exchanges and the
official SUNAT reference rate.

[https://dollarpe-api.cristianbgp.com/exchanges](https://dollarpe-api.cristianbgp.com/exchanges)

## Development

To install dependencies:

```sh
bun install --frozen-lockfile
```

To run:

```sh
bun run dev
```

Open http://localhost:3000.

To run the type checker and test suite:

```sh
bun run check
```

## Endpoints

Interactive Swagger documentation is available at [`/docs`](https://dollarpe-api.cristianbgp.com/docs).
The generated OpenAPI 3.1 document is available at
[`/openapi.json`](https://dollarpe-api.cristianbgp.com/openapi.json).
The exact source of this README is available as Markdown at
[`/readme`](https://dollarpe-api.cristianbgp.com/readme).

The root endpoint is text-only and requires no JavaScript. It returns a concise
endpoint index as `text/plain` by default. Agents can request the same index as
Markdown from the canonical URL:

```sh
curl -H "Accept: text/markdown" https://dollarpe-api.cristianbgp.com/
```

Negotiated responses include `Vary: Accept, Accept-Encoding`. A request that
explicitly excludes both `text/plain` and `text/markdown` receives `406 Not
Acceptable`; the service intentionally does not provide an HTML homepage.

### `GET /exchanges`

Get the current rates from every available provider:

```text
/exchanges
```

Use the `sort` query parameter to order the best buy or sell rates:

```text
/exchanges?sort=buy
/exchanges?sort=sell
```

- `buy` is the default and sorts the highest buy rate first.
- `sell` sorts the lowest sell rate first.

Example response:

```json
[
  [
    "sunat",
    {
      "buy": 3.34,
      "sell": 3.348,
      "pageUrl": "https://e-consulta.sunat.gob.pe/cl-at-ittipcam/tcS01Alias"
    }
  ]
]
```

Each provider has a five-second timeout. Providers that time out, return an
unsuccessful HTTP status, or return invalid rates are omitted without failing
the complete response. If every provider fails, the endpoint returns `503`
instead of an empty successful response.

An unsupported `sort` value returns `400`.

Rates are collected from:

- Rextie
- Kambista
- TKambio
- Roblex
- Decamoney
- TuCambista
- ChapaCambio
- Cambio Mundial
- SUNAT (official reference rate)

### `GET /official-rate`

Get today's official SUNAT rate using the current date in `America/Lima`:

```text
/official-rate
```

Use the optional `date` query parameter for a historical rate:

```text
/official-rate?date=2025-11-17
```

The date must use the `YYYY-MM-DD` format and cannot be in the future. On days
without a new publication, such as weekends or holidays, the endpoint returns
the latest available official rate.

Example response:

```json
{
  "source": "sunat",
  "date": "2025-11-17",
  "buy": 3.365,
  "sell": 3.374,
  "pageUrl": "https://e-consulta.sunat.gob.pe/cl-at-ittipcam/tcS01Alias"
}
```

Invalid or future dates return `400`. If SUNAT is temporarily unavailable, the
endpoint returns `503`.

## Errors

API errors use JSON with a stable `code`, a human-readable `message`, and a
recovery `hint`. The original `error` field remains available for compatibility:

```json
{
  "error": "Invalid sort criteria",
  "code": "INVALID_SORT",
  "message": "Invalid sort criteria",
  "hint": "Use sort=buy or sort=sell."
}
```

Unknown paths return a real `404` with Markdown links to `/readme`, `/docs`, and
`/openapi.json`. Clients requesting `application/json` receive the same recovery
information as a structured JSON error.
