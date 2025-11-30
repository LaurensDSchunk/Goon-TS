// Map of target objects => (Map of properties => Set of effects)
const targetMap = new WeakMap<any, Map<string | symbol, Set<() => void>>>();
let currentEffect: (() => void) | null = null;

export type Reactive<T> = {
  [K in keyof T]: T[K] extends Function ? T[K] :
                  T[K] extends object ? Reactive<T[K]> : T[K]
};

export type Ref<T> = Reactive<{value: T}>

export function reactive<T extends object>(obj: T): Reactive<T> {
  return new Proxy(obj, {
    get(target: T, prop: string | symbol) {
      // Tracks dependencies
      if (currentEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
          depsMap = new Map();
          targetMap.set(target, depsMap);
        }

        let deps = depsMap.get(prop);
        if (!deps) {
          deps = new Set();
          depsMap.set(prop, deps);
        }

        deps.add(currentEffect);
      }

      const value = target[prop as keyof T];
      if (typeof value === "object" && value !== null) {
        return reactive(value); // Deep reactive
      } 
      return value;
    },

    set(target: T, prop: string | symbol, newValue: any): boolean {
      target[prop as keyof T] = newValue;

      const depsMap = targetMap.get(target);
      const deps = depsMap?.get(prop);
      deps?.forEach((fn) => fn());

      return true;
    },
  });
}

// Wraps a primative in a reactive object
export function ref<T>(value: T): Ref<T> {
  const state = reactive({ value });

  return {
    get value() {
      return state.value;
    },
    set value(v) {
      state.value = v;
    },
  };
}


export function effect(fn: () => void): void {
  currentEffect = fn;
  fn(); // Run it to register dependencies
  currentEffect = null;
}
