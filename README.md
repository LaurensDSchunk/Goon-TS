# Goon TS -  The sigma's frontend framework

# Reactivity API

- `reactive()`:
  Creates a reactive proxy around an object that runs dependent functions when the value is changed.
- `ref()`:
  Creates a reactive proxy around an object that wraps the input value. To access the value, one must
  access it's `.value` attribute. Ref is nessesarry to make a primitive reactive. Ref can also be used
  to track when the entire object is replaced.
  ```
  const a = reactive([1,2,3])
  // No way to replace the array object as a whole

  const b = ref([1,2,3])
  r.value = [4,5,6] <-- Triggers any dependent functions
  ```
- `effect()`:
  The function passed in is run once immediately and tracks all dependencies accessed. If any dependencies 
  are modified, the function will be re-run. 
  Note that only dependencies found in the first execution are tracked. If a dependency is run in a branch,
  consider accessing it's value at the start of the function:
  ```
  const a = ref(0)
  const b = ref(3)
  effect(() => {
    b.value; <-- Collects b as a dependency
    if (a.value > 5) {
      console.log(b.value) <-- Not run initially, won't be detected
    }
  })
  ```
- `computed()`: 
  Creates a reactive value that can use other reactive values as dependencies.
  By default, the value is lazily evaluated, meaning it is only calculated
  when `.value` is accessed. If a computed value is a dependency to an effect,
  any change to the computed value's dependencies will re-run the effect.
  ```
  const a = ref("hello")
  const b = ref("world")
  const c = computed(() => {
    return a.value + " " + b.value
  })

  console.log(c.value) <-- c.value will be first computed here

  effect(() => {
    console.log("c changed: " + c.value)
  })

  a.value = "Goon" <-- will trigger the effect.
  ```