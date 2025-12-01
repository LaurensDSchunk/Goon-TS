export type Reactive<T> = {
  [K in keyof T]: T[K] extends object ? Reactive<T[K]> : T[K];
};
export type Ref<T> = Reactive<{ value: T }>;

const effectMap = new WeakMap<any, Map<string | symbol, Set<() => void>>>();
let currentEffect: (() => void) | null = null;

function reactive<T extends object>(value: T): Reactive<T> {
  return new Proxy(value, {
    get(target, prop, receiver) {
      // Track effect dependencies
      if (currentEffect !== null) {
        let targetMap = effectMap.get(target);
        if (!targetMap) {
          targetMap = new Map();
          effectMap.set(target, targetMap);
        }

        let propSet = targetMap.get(prop);
        if (!propSet) {
          propSet = new Set();
          targetMap.set(prop, propSet);
        }

        propSet.add(currentEffect);
      }

      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "object" && value !== null) {
        return reactive(value); // Deep reactive
      }
      return value;
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);

      const deps = effectMap.get(target)?.get(prop);
      deps?.forEach((fn) => fn());

      return result;
    },
  });
}

export function ref<T>(value: T): Ref<T> {
  // If it's already an object, make it reactive
  if (typeof value === "object" && value !== null) {
    const reactiveObj = reactive(value as object);
    return { value: reactiveObj } as Ref<T>;
  }

  // Otherwise wrap primitive in { value } and make reactive
  const wrapper = reactive({ value });
  return {
    get value() {
      return wrapper.value;
    },
    set value(v) {
      wrapper.value = v;
    },
  }
}

export function effect(fn: () => void) {
  currentEffect = fn;
  fn();
  currentEffect = null;
}