import "./style.css";

import { ref, reactive, type Ref, type Reactive } from "./reactive";
import g, { Element } from "./element";

const color = reactive({color: "green", backgroundColor: "black"});
const obj = reactive({ text: "Hello World" });

function Counter(style: Reactive<{color: string, backgroundColor: string}>): Element {
  const count = ref(0);
  return g
    .div()
    .style(style)
    .children([
      count,
      g
        .button()
        .props({ onclick: () => count.value++ })
        .children(["Increment"]),
    ]);
}

const app = g
  .div()
  .props({ id: "root" })
  .children([Counter(color)]);

// Mount to DOM
app.mount("app");

// Later: update reactive values automatically
setTimeout(() => {
  color.color = "blue";
  color.backgroundColor = "purple"
  obj.text = "Updated!";
}, 1000);
