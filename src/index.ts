import { effect, reactive, ref } from "./reactive"

const count = ref(0)

function Counter() {
  return () => `<div>Count is ${count.value}</div>`
}

effect(() => {
  console.log(Counter()());
})

setInterval(() => count.value += 13, 300)