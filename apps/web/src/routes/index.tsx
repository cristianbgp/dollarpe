import Terminal from "@/components/Terminal";
import { A } from "@solidjs/router";
import { onMount } from "solid-js";
import Typewriter from "typewriter-effect/dist/core";

export default function Home() {
  onMount(() => {
    const $dollarpe_title_typewriter = document.getElementById(
      "dollarpe_title_typewriter",
    );
    if (!$dollarpe_title_typewriter) return;

    const typewriter = new Typewriter($dollarpe_title_typewriter);
    typewriter.typeString("dollarpe").start();
  });

  return (
    <div class="flex min-h-screen flex-col justify-center bg-gray-100 font-mono">
      <header class="flex items-center justify-center px-8 py-12">
        <h1 id="dollarpe_title_typewriter" class="text-4xl md:text-6xl" />
      </header>
      <Terminal />
      <div class="mb-8 flex flex-col items-center justify-center space-x-0 space-y-2 md:flex-row md:space-x-2 md:space-y-0">
        <A
          href="https://github.com/cristianbgp/dollarpe/tree/main/apps/cli"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md bg-[#2A2B2F] px-3 py-2 text-white transition-colors hover:bg-[#585a60]"
        >
          CLI
        </A>
        <A
          href="https://github.com/cristianbgp/dollarpe/tree/main/apps/api"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md bg-[#2A2B2F] px-3 py-2 text-white transition-colors hover:bg-[#585a60]"
        >
          API
        </A>
      </div>
      <footer class="flex items-center justify-center pb-4">
        <a
          href="https://cristianbgp.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by @cristianbgp
        </a>
      </footer>
    </div>
  );
}
