export * from "./element";
export * from "./reactive";
export * from "./g";

import { document, window } from "./dom";
import { g } from "./g";
import { ref } from "./reactive";

const r = ref(34);

const app = g
  .h1()
  .props({ id: "idexample", className: "coll blud" })
  .style({ color: "red" })
  .children([
    g.button().children([r]),
    g
      .div()
      .children(
        Array.from({ length: 3 }, () =>
          g.input().props({ type: "checkbox", checked: true })
        )
      ),
  ]);

document.body.innerHTML = `<div id="app"></div>`
app.mount("#app")
console.log(document.body.innerHTML)