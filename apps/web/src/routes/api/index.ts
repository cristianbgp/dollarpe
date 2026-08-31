import {
  listExchangeRates,
  type Error as ApiError,
  type ListExchangeRatesParams,
} from "@/generated/dollarpe";
import type { APIEvent } from "@solidjs/start/server";

type ApiFetchError = globalThis.Error & {
  info: ApiError;
  status: 400 | 503;
};

function isApiFetchError(error: unknown): error is ApiFetchError {
  if (!(error instanceof globalThis.Error)) return false;

  const candidate = error as Partial<ApiFetchError>;
  return (
    (candidate.status === 400 || candidate.status === 503) &&
    candidate.info !== undefined
  );
}

export async function GET(event: APIEvent) {
  const url = new URL(event.request.url);
  const queryParams = new URLSearchParams(url.search);
  const sort = (queryParams.get("sort") ||
    "buy") as ListExchangeRatesParams["sort"];

  try {
    const { data } = await listExchangeRates({ sort });
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    if (isApiFetchError(error)) {
      return Response.json(error.info, { status: error.status });
    }

    console.error(error);
    return new Response(JSON.stringify({ message: "Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
