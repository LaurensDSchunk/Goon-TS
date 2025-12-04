import { g } from "./g";
import { computed, ref } from "./reactive";

// Register happy-dom if not in the browser
await new Promise<void>(async (resolve) => {
  try {
    window;
    document;
  } catch {
    const happy = await import("@happy-dom/global-registrator");
    happy.GlobalRegistrator.register();
  }
  document.body.innerHTML = `<div id="app"></div>`
  resolve();
});

export * from "./reactive";
export * from "./g"

const len = ref(5);
const children = computed(() => {
  return Array.from({ length: len.value }, () => g.h1().children(["goon"]));
});
const app = g.div().children(children);

app.mount("#app")
