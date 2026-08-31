import { accepts } from "hono/accepts";
import type { Context } from "hono";

const getQuality = (params: Record<string, string>, fallback: number) => {
  const quality = Object.entries(params).find(
    ([name]) => name.toLowerCase() === "q",
  )?.[1];

  if (quality === undefined) return fallback;

  const parsed = Number(quality);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0;
};

const matchesMediaParameters = (params: Record<string, string>) => {
  const entries = Object.entries(params);
  const qualityIndex = entries.findIndex(
    ([name]) => name.toLowerCase() === "q",
  );
  const mediaParameters =
    qualityIndex === -1 ? entries : entries.slice(0, qualityIndex);

  return mediaParameters.every(
    ([name, value]) =>
      name.toLowerCase() === "charset" && value.toLowerCase() === "utf-8",
  );
};

const matchSpecificity = (
  acceptedType: string,
  supportedType: string,
  params: Record<string, string>,
) => {
  if (!matchesMediaParameters(params)) return 0;

  const accepted = acceptedType.toLowerCase();
  const supported = supportedType.toLowerCase();

  if (accepted === supported) return 3;

  const [acceptedMain, acceptedSub] = accepted.split("/");
  const [supportedMain] = supported.split("/");

  if (acceptedMain === supportedMain && acceptedSub === "*") return 2;
  if (accepted === "*/*" || accepted === "*") return 1;

  return 0;
};

export const negotiateContentType = (
  c: Context,
  supportedTypes: string[],
  defaultType: string,
) =>
  accepts(c, {
    header: "Accept",
    supports: supportedTypes,
    default: defaultType,
    match: (acceptedTypes, config) => {
      const candidates = config.supports
        .map((supportedType, supportedIndex) => {
          const matches = acceptedTypes
            .map((acceptedType, acceptedIndex) => ({
              acceptedIndex,
              q: getQuality(acceptedType.params, acceptedType.q),
              specificity: matchSpecificity(
                acceptedType.type,
                supportedType,
                acceptedType.params,
              ),
            }))
            .filter(({ specificity }) => specificity > 0)
            .sort(
              (left, right) =>
                right.specificity - left.specificity ||
                right.q - left.q ||
                left.acceptedIndex - right.acceptedIndex,
            );

          const bestMatch = matches[0];

          return {
            supportedType,
            supportedIndex,
            q: bestMatch?.q ?? 0,
            acceptedIndex: bestMatch?.acceptedIndex ?? Number.MAX_SAFE_INTEGER,
          };
        })
        .filter(({ q }) => q > 0)
        .sort(
          (left, right) =>
            right.q - left.q ||
            left.acceptedIndex - right.acceptedIndex ||
            left.supportedIndex - right.supportedIndex,
        );

      if (candidates[0]) return candidates[0].supportedType;

      const hasPositivePreference = acceptedTypes.some(
        ({ params, q }) => getQuality(params, q) > 0,
      );

      if (!hasPositivePreference) {
        const nonExcludedType = config.supports.find((supportedType) =>
          acceptedTypes.every(
            (acceptedType) =>
              getQuality(acceptedType.params, acceptedType.q) > 0 ||
              matchSpecificity(
                acceptedType.type,
                supportedType,
                acceptedType.params,
              ) === 0,
          ),
        );

        if (nonExcludedType) return nonExcludedType;
      }

      return "not-acceptable";
    },
  });

export const setNegotiatedResponseHeaders = (c: Context) => {
  c.header("Vary", "Accept, Accept-Encoding");
};

export type ApiError = {
  error: string;
  code: string;
  message: string;
  hint: string;
};

export const createApiError = (
  code: string,
  message: string,
  hint: string,
): ApiError => ({
  error: message,
  code,
  message,
  hint,
});
