import { test, expect } from "bun:test";
import { computed, g, ref } from "../src";

test("GoonText should be replaced with a TextNode", () => {
  document.body.innerHTML=`<div id="app"></div>`
  const app = g.text("text  from the  textNode")
  app.mount("#app")
  expect(document.getElementById("app")?.innerText).toBe("text  from the  textNode")
})

test("GoonText should accept ref text", () => {
  document.body.innerHTML=`<div id="app"></div>`
  const text = ref("text  from the  textNode")
  const app = g.text(text)
  app.mount("#app")
  expect(document.getElementById("app")?.innerText).toBe("text  from the  textNode")
  text.value = "newText"
  expect(document.getElementById("app")?.innerText).toBe("newText");
})

test("GoonText should accept computed text", () => {
  document.body.innerHTML=`<div id="app"></div>`
  const a = ref("ogText")
  const text = computed(() => {
    return a.value + a.value;
  })
  const app = g.text(text)
  app.mount("#app")
  expect(document.getElementById("app")?.innerText).toBe("ogTextogText")
  a.value = "newText"
  expect(document.getElementById("app")?.innerText).toBe("newTextnewText");
})

test("GoonTest should connect the right element to the ref", () => {
  document.body.innerHTML=`<div id="app"></div>`
  const node = ref<Text>(null!)
  const app = g.text("texttre").ref(node)
  app.mount("#app")

  expect(node.value).toBeInstanceOf(Text)
  expect(node.value.textContent).toBe("texttre")
})