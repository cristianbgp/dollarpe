type WorkerCache = {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
};

type WorkerCacheStorage = {
  default?: WorkerCache;
};

type CachedValueOptions<T> = {
  key: string;
  ttlSeconds: number;
  load: () => Promise<T>;
  validate: (value: unknown) => value is T;
};

const CACHE_BASE_URL =
  "https://dollarpe-api.cristianbgp.com/.provider-cache/";

function defaultCache(): WorkerCache | undefined {
  return (globalThis as unknown as { caches?: WorkerCacheStorage }).caches
    ?.default;
}

function cacheRequest(key: string): Request {
  return new Request(`${CACHE_BASE_URL}${encodeURIComponent(key)}`);
}

export async function withProviderCache<T>({
  key,
  ttlSeconds,
  load,
  validate,
}: CachedValueOptions<T>): Promise<T> {
  const cache = defaultCache();
  if (!cache) return load();

  const request = cacheRequest(key);

  try {
    const response = await cache.match(request);
    if (response) {
      const value = (await response.json()) as unknown;
      if (validate(value)) return value;
    }
  } catch {
    // Cache failures must not make an otherwise healthy provider disappear.
  }

  const value = await load();

  try {
    await cache.put(
      request,
      Response.json(value, {
        headers: { "Cache-Control": `public, max-age=${ttlSeconds}` },
      })
    );
  } catch {
    // The upstream result is still valid even when an edge cache write fails.
  }

  return value;
}
