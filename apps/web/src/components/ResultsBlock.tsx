import Loader from "@/components/Loader";
import { API_URL } from "@/config";
import { createQuery } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";

export default function ResultsBlock() {
  const dataQuery = createQuery(() => ({
    queryKey: ["exchanges"],
    queryFn: async () => {
      const response = await fetch(API_URL);
      return response.json();
    },
    retry: (failureCount) => {
      if (failureCount < 5) return true;
      return false;
    },
    retryDelay: 15000,
  }));

  return (
    <p class="flex flex-col ml-3">
      <Switch>
        <Match when={dataQuery.isLoading}>
          <Loader />
        </Match>
        <Match when={dataQuery.error}>
          <span class="flex flex-col ml-3 text-red-500">
            <span>Something went wrong 🚨</span>
            <span>Try again later</span>
          </span>
        </Match>

        <Match when={dataQuery.data}>
          <For each={dataQuery.data}>
            {([name, { buy, sell, pageUrl }], index) => (
              <span class="flex flex-col">
                <span>
                  <a
                    href={pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-red-400 border-b border-red-400 border-dashed"
                  >
                    {name}
                  </a>
                </span>
                <span class={index() === 0 ? "text-green-400" : ""}>
                  <span class="text-blue-400">buy: </span>
                  {buy}
                </span>
                <span class={index() === 0 ? "text-green-400" : ""}>
                  <span class="text-blue-400">sell: </span>
                  {sell}
                </span>
              </span>
            )}
          </For>
        </Match>
      </Switch>
    </p>
  );
}
