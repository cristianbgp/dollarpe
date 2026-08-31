import { createEffect, createSignal, onCleanup } from "solid-js";

const dots = {
  interval: 80,
  frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
};

export default function Loader() {
  const [loader, setLoader] = createSignal(0);

  createEffect(() => {
    const timer = setInterval(() => {
      setLoader((prevLoader) =>
        dots.frames.length - 1 === prevLoader ? 0 : prevLoader + 1
      );
    }, dots.interval);

    onCleanup(() => {
      clearInterval(timer);
    });
  });

  return <span class="font-mono">{dots.frames[loader()]} Loading...</span>;
}
