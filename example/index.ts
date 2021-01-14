import { NProgress } from "../dist/index";

document.addEventListener("DOMContentLoaded", () => {
  const status = document.querySelector("#status")! as HTMLElement;
  const bar = document.querySelector("#bar")! as HTMLElement;

  NProgress.observeChange((progress, state) => {
    bar.style.width = `${progress * 100}%`;

    status.innerText = `progress ${Math.round(
      progress * 100
    )}%; ${JSON.stringify(state)};`;

    if (state.started) {
      bar.style.opacity = "1";
    }
    if (state.finished) {
      setTimeout(() => (bar.style.opacity = "0"), 100);
      setTimeout(() => (bar.style.width = "0"), 500);
    }
  });

  document.querySelector("#loading")?.addEventListener("click", () => {
    NProgress.start();
    setTimeout(() => NProgress.done(), 5000);
  });
});
