const proxyCache = new WeakMap<object, any>();

const effectDeps = new WeakMap<Object, Map<string | symbol, Set<() => void>>>();
const currentEffects: (() => void)[] = [];

// Object -> prop -> dependent function
const computedDeps = new WeakMap<
  object,
  Map<symbol | string, Set<() => any>>
>();
// If a computed is in here, it will re-compute its value when accessed
const invalidComputed = new Set<() => any>();
const currentComputed: (() => any)[] = [];

const computedEffectDeps = new Map<() => any, Set<() => void>>();

export type Reactive<T extends object> = T;
export type Ref<T> = Reactive<{ value: T }>;

function trackFunctionDeps(
  depMap: WeakMap<Object, Map<string | symbol, Set<() => any>>>,
  current: (() => any)[],
  target: object,
  prop: string | symbol
) {
  if (current.length === 0) return;

  let propsMap = depMap.get(target);
  if (!propsMap) {
    propsMap = new Map();
    depMap.set(target, propsMap);
  }

  let deps = propsMap.get(prop);
  if (!deps) {
    deps = new Set();
    propsMap.set(prop, deps);
  }

  // Add dependency to the currently running function
  deps.add(current[current.length - 1]!);
}

function track(target: Object, prop: string | symbol) {
  // Find dependencies of effects
  trackFunctionDeps(effectDeps, currentEffects, target, prop);

  // Find dependencies of computed functions
  trackFunctionDeps(computedDeps, currentComputed, target, prop);
}

function trigger(target: Object, prop: string | symbol) {
  // Tracks the effects that have already been run to not run them twice
  const runEffects = new Set<() => any>();

  const comps = computedDeps.get(target)?.get(prop);
  comps?.forEach((v) => {
    invalidComputed.add(v);

    // If an effect has a computed dependency, run the effect
    const effs = computedEffectDeps.get(v);
    effs?.forEach((fn) => {
      fn();
      runEffects.add(fn);
    });
  });

  // Get and run all dependent effects
  const effects = effectDeps.get(target)?.get(prop)?.difference(runEffects);
  effects?.forEach((fn) => fn());
}

export function reactive<T extends object>(value: T): Reactive<T> {
  if (proxyCache.has(value)) return proxyCache.get(value);

  const proxy = new Proxy(value, {
    get(target, prop, receiver) {
      track(target, prop);

      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "object" && value !== null) {
        return reactive(value); // Deep reactive
      }
      return value;
    },

    set(target, prop, newValue, receiver) {
      const oldValue = (target as any)[prop];

      // Only trigger when value changed
      if (Object.is(oldValue, newValue)) {
        return true;
      }

      Reflect.set(target, prop, newValue, receiver);
      trigger(target, prop);

      return true;
    },
  });

  proxyCache.set(value, proxy);
  return proxy;
}

export function ref<T>(value: T): Ref<T> {
  let state = value;

  return {
    get value() {
      track(this, "value");
      return state;
    },
    set value(newValue) {
      if (newValue === state) return;
      state = newValue;
      trigger(this, "value");
    },
  };
}

/**
 * Runs the function once immediatley and then again each time a dependency changes.
 * Dependencies are only detected in the first, initial run.
 */
export function effect(fn: () => void) {
  currentEffects.push(fn);
  fn();
  currentEffects.pop();
}

export function computed<T>(fn: () => T): Ref<T> {
  let value: T = null!;
  invalidComputed.add(fn);

  return {
    get value() {
      if (invalidComputed.has(fn)) {
        currentComputed.push(fn);
        value = fn();
        currentComputed.pop();

        invalidComputed.delete(fn);
      }

      if (currentEffects.length !== 0) {
        let deps = computedEffectDeps.get(fn);
        if (!deps) {
          deps = new Set();
          computedEffectDeps.set(fn, deps);
        }
        deps.add(currentEffects[currentEffects.length - 1]!);
      }

      return value;
    },
    set value(_) {
      throw new Error(
        "You cannot set the value of a computed value. It is readonly."
      );
    },
  };
}
