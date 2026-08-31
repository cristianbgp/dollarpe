import Terminal from "@/components/Terminal";
import { A } from "@solidjs/router";
import { onMount } from "solid-js";
import Typewriter from "typewriter-effect/dist/core";

export default function Home() {
  onMount(() => {
    const $dollarpe_title_typewriter = document.getElementById(
      "dollarpe_title_typewriter"
    );
    if (!$dollarpe_title_typewriter) return;

    const typewriter = new Typewriter($dollarpe_title_typewriter);
    typewriter.typeString("dollarpe").start();
  });

  return (
    <div class="bg-gray-100 flex justify-center flex-col min-h-screen font-mono">
      <header class="flex justify-center items-center px-8 py-12">
        <h1 id="dollarpe_title_typewriter" class="text-4xl md:text-6xl" />
      </header>
      <Terminal />
      <div class="flex justify-center items-center flex-col space-x-0 space-y-2 md:flex-row md:space-x-2 md:space-y-0 mb-8">
        <A
          href="https://github.com/cristianbgp/dollarpe/tree/main/apps/cli"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-[#2A2B2F] hover:bg-[#585a60] text-white transition-colors rounded-md px-3 py-2"
        >
          CLI
        </A>
        <A
          href="https://github.com/cristianbgp/dollarpe/tree/main/apps/api"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-[#2A2B2F] hover:bg-[#585a60] text-white transition-colors rounded-md px-3 py-2"
        >
          API
        </A>
      </div>
      <footer class="flex justify-center items-center pb-4">
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
