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
    <main class="p-8 flex justify-center items-center">
      <div class="flex flex-col bg-[#2A2B2F] min-h-[420px] max-w-[800px] w-full p-2 rounded-lg">
        <div class="flex space-x-2">
          <div class="rounded-full w-4 h-4 bg-[#FF5F56]" />
          <div class="rounded-full w-4 h-4 bg-[#FDBB2C]" />
          <div class="rounded-full w-4 h-4 bg-[#27C840]" />
        </div>
        <div class="h-full py-2 text-white">
          <div class="flex">
            <span class="text-[#5AF78F] mr-1">→</span>
            <span id="dollarpe_typewriter"></span>
          </div>
          {showResultBlock() && <ResultsBlock />}
        </div>
      </div>
    </main>
  );
}
