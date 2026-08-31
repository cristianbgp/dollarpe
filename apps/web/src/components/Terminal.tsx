import { createSignal, onMount } from "solid-js";
import ResultsBlock from "@/components/ResultsBlock";
import Typewriter from "typewriter-effect/dist/core";

export default function Terminal() {
  const [showResultBlock, setShowResultBlock] = createSignal(false);

  onMount(() => {
    const $dollarpe_typewriter = document.getElementById("dollarpe_typewriter");
    if (!$dollarpe_typewriter) return;

    const typewriter = new Typewriter($dollarpe_typewriter);
    typewriter
      .pauseFor(1500)
      .typeString("dollarpe")
      .callFunction(() => {
        setShowResultBlock(true);
      })
      .start();
  });

  return (
    <main class="flex items-center justify-center p-8">
      <div class="flex min-h-[420px] w-full max-w-[800px] flex-col rounded-lg bg-[#2A2B2F] p-2">
        <div class="flex space-x-2">
          <div class="h-4 w-4 rounded-full bg-[#FF5F56]" />
          <div class="h-4 w-4 rounded-full bg-[#FDBB2C]" />
          <div class="h-4 w-4 rounded-full bg-[#27C840]" />
        </div>
        <div class="h-full py-2 text-white">
          <div class="flex">
            <span class="mr-1 text-[#5AF78F]">→</span>
            <span id="dollarpe_typewriter"></span>
          </div>
          {showResultBlock() && <ResultsBlock />}
        </div>
      </div>
    </main>
  );
}
