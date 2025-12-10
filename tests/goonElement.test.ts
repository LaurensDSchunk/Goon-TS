import { test, expect, beforeEach } from "bun:test";
import { g, reactive, ref } from "../src";

beforeEach(() => {
  document.body.innerHTML = `<div id="app"></div>`;
});

test("GoonElement should be replaced with the correct element", () => {
  const app = g.h1();
  app.mount("#app");
  expect(document.getElementById("app")?.innerHTML).toBe(`<h1></h1>`);
});

test("GoonElement.style should apply inline styles", () => {
  const app = g.h1().style({ color: "red" });
  app.mount("#app");
  expect(document.getElementById("app")?.innerHTML).toBe(
    `<h1 style="color: red;"></h1>`
  );
});

test("GoonElement.style should accept reactive values", () => {
  const style = reactive({ color: "red" });
  const app = g.h1().style(style);
  app.mount("#app");
  expect(document.getElementById("app")?.innerHTML).toBe(
    `<h1 style="color: red;"></h1>`
  );
  style.color = "blue";
  expect(document.getElementById("app")?.innerHTML).toBe(
    `<h1 style="color: blue;"></h1>`
  );
});

test("GoonElement.style should accept ref values", () => {
  const color = ref("red");
  const app = g.h1().style({ color });
  app.mount("#app");
  expect(document.getElementById("app")?.innerHTML).toBe(
    `<h1 style="color: red;"></h1>`
  );
  color.value = "blue";
  expect(document.getElementById("app")?.innerHTML).toBe(
    `<h1 style="color: blue;"></h1>`
  );
});

test("GoonElement.props should apply element props", () => {
  const app = g.h1().props({ id: "crazyid" });
  app.mount("#app");
  expect(document.getElementById("app")?.innerHTML).toBe(
    `<h1 id="crazyid"></h1>`
  );
});

test("GoonElement.props should accept reactive values", () => {
  const props = reactive({ id: "crazyid", className: "blud" });
  const app = g.h1().props(props);
  app.mount("#app");
  expect(document.getElementById("app")?.innerHTML).toBe(
    `<h1 id="crazyid" class="blud"></h1>`
  );
  props.id = "newId";
  expect(document.getElementById("app")?.innerHTML).toBe(
    `<h1 id="newId" class="blud"></h1>`
  );
});

test("GoonElement.props should accept ref values", () => {
  const className = ref("sigma");
  const app = g.h1().props({ className });
  app.mount("#app");
  expect(document.getElementById("app")?.innerHTML).toBe(
    `<h1 class="sigma"></h1>`
  );
  className.value = "soigma";
  expect(document.getElementById("app")?.innerHTML).toBe(
    `<h1 class="soigma"></h1>`
  );
});

test("GoonElement.children should accept an array", () => {
  const app = g.div().children(["text", g.h1().children(["h1text"]), 1]);
  app.mount("#app");
  expect(document.getElementById("app")?.innerHTML).toBe(
    `<div>text<h1>h1text</h1>1</div>`
  );
});

test("GoonElement.children should accept a single value", () => {
  const app = g.div().children("text");
  app.mount("#app");
  expect(document.getElementById("app")?.innerHTML).toBe(`<div>text</div>`);
});

test("GoonElement.children should be reactive", () => {
  const a = ref(1);
  const b = ref("testValue");
  const app = g.h1().children([a, b]);
  app.mount("#app");
  expect(document.getElementById("app")?.innerHTML).toBe(`<h1>1testValue</h1>`);
  a.value = 2;
  expect(document.getElementById("app")?.innerHTML).toBe(`<h1>2testValue</h1>`);
});

test("GoonElement.ref shuld assign the correct HTML element", () => {
  const a = ref<HTMLElement>(null!)
  const app = g.h1().ref(a);
  app.mount("#app")
  expect(a.value).toBeInstanceOf(HTMLHeadingElement)
});
