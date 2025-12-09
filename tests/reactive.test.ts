import { test, expect } from "bun:test";
import { computed, effect, reactive, ref } from "../src";

test("Reactive values should act like normal objects", () => {
  const obj = reactive({ value: 1 });
  expect(obj.value).toBe(1);
  obj.value = 10;
  expect(obj.value).toBe(10);
});

test("Reactive values should trigger effects on write", () => {
  let count = 0;
  const obj = reactive({ value: 1 });

  effect(() => {
    obj.value;
    count++;
  });

  expect(count).toBe(1);
  obj.value++;
  expect(count).toBe(2);
});

test("Nested reactive values should trigger effects on write", () => {
  let count = 0;
  const obj = reactive({ nested: { value: 1 } });

  effect(() => {
    obj.nested.value;
    count++;
  });

  expect(count).toBe(1);
  obj.nested.value++;
  expect(count).toBe(2);
});

test("Reactive values should not trigger effects on read", () => {
  let count = 0;
  const obj = reactive({ value: 1 });

  effect(() => {
    obj.value;
    count++;
  });

  expect(count).toBe(1);
  obj.value;
  expect(count).toBe(1);
});

test("Writing same value to reactive should not retrigger effect", () => {
  let count = 0;
  const obj = reactive({ x: 1 });

  effect(() => {
    obj.x;
    count++;
  });

  expect(count).toBe(1);
  obj.x = 1;
  expect(count).toBe(1);
});

test("Refs should be able to be read and written", () => {
  const obj = ref(0);
  expect(obj.value).toBe(0);
  obj.value++;
  expect(obj.value).toBe(1);
});

test("Refs should trigger effects on write", () => {
  let count = 0;
  const obj = ref(1);

  effect(() => {
    obj.value;
    count++;
  });

  expect(count).toBe(1);
  obj.value++;
  expect(count).toBe(2);
});

test("Refs should not trigger effects on read", () => {
  let count = 0;
  const obj = ref(1);

  effect(() => {
    obj.value;
    count++;
  });

  expect(count).toBe(1);
  obj.value;
  expect(count).toBe(1);
});

test("Writing same value to ref should not retrigger effect", () => {
  let count = 0;
  const obj = ref(1);

  effect(() => {
    obj.value;
    count++;
  });

  expect(count).toBe(1);
  obj.value = 1;
  expect(count).toBe(1);
});

test("Computed values should not be calculated unless accessed", () => {
  let count = 0;

  const comp = computed(() => {
    count++;
    return 1;
  });

  expect(count).toBe(0);
  comp.value;
  expect(count).toBe(1);
});

test("Computed values should be cached", () => {
  let count = 0;

  const comp = computed(() => {
    count++;
    return 1;
  });

  expect(count).toBe(0);
  comp.value;
  expect(count).toBe(1);
  comp.value
  expect(count).toBe(1)
});

test("Computed value dependency changes should trigger effects", () => {
  const a = ref(1);
  let count = 0;
  const comp = computed(() => {
    return a.value;
  });

  effect(() => {
    count++;
    comp.value
  })

  expect(count).toBe(1)
  a.value++
  expect(count).toBe(2)
});

test("Computed values cannot be set", () => {
  const comp = computed(() => 0)
  expect(() => comp.value++).toThrow()
});
