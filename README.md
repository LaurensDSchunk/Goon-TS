# Goon TS - The sigma's frontend framework

## Reactivity API

- `reactive()`:
  Creates a reactive proxy around an object that runs dependent functions when
  the value is changed.
- `ref()`:
  Creates a reactive proxy around an object that wraps the input value. To 
  access the value, one must access it's `.value` attribute. Ref is nessesarry 
  to make a primitive reactive. Ref can also be used to track when the entire 
  object is replaced.
  ```
  const a = reactive([1,2,3])
  // No way to replace the array object as a whole
  a[0] = 67 <-- Triggers any dependent functions

  const b = ref([1,2,3])
  r.value = [4,5,6] <-- Triggers any dependent functions
  ```

- `effect()`:
  The function passed in is run once immediately and tracks all dependencies 
  accessed. If any dependencies are modified, the function will be re-run. 
  Note that only dependencies found in the first execution are tracked. If a 
  dependency is run in a branch, consider accessing it's value at the start of
  the function:
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
  any change to the computed value's dependencies will re-run the effect. A 
  computed value can be used exactly like a ref, with the exception that it is
  readonly.

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

## The `g` object

The `g` object holds all of the built-in components that can be created.
It includes every HTML element as well as some library-specific ones. The 
attributes of each element can be configured as follows:

- `.props()`:
  An object (including a reactive object) can configure the properties of 
  the element using the same naming as classic JS DOM manipulation (eg. 
  `className`, `id`). Values can be reactive, and changes to their values
  will be reflected in the DOM. 
  ```
  const reactiveProps = reactive({id: "sigma", className: "tuff"})
  g.h1().props(reactiveProps);
  reactiveProps.className = "blud" <-- DOM element will update automatically

  ---
  const class = ref("tuff")

  g.h1().props({className: class})
  class.value = "blud" <-- DOM element will update automatically
  ```

- `.style()`:
  Same as props but with CSS style attributes. 
  ```
  const color = ref("blue")
  g.h1().style({color})
  color.value = "red" <-- h1 turns red
  ```
- `.children()`: 
  Accepts an array, a reactive value containing an array, or a function 
  returning an array. The array can hold any data type, but all child values 
  (excluding another `GoonElement`) are converted to a string before being 
  placed in the DOM. Reactive values will be reflected in the DOM and 
  `GoonElement` children will be rendered recursivley.
  ```
  const count = ref(5)
  const computedChildren = computed(() => {
    return Array.from({length: count.value}, () => g.h1().children(["67"]))
  })
  g.div().children(computedChildren); <-- Changing count.value will update DOM

  ---
  const name = reactive({first: "Einstein"})
  g.div().children(["hello", 67, name.first])
  ```

## Mounting a `GoonElement`
Calling `.mount()` will attach a g-tree to the element matching the input 
query selector. The tree will then attempt to render. There are 2 paths:
- If the contents of the mounting target are empty, Goon TS will create all
  elements and connect reactive values and their elements.
- If the mounting target contains anything, Goon TS will attempt to hydrate,
  connecting reactive values with their elements. If the existing tree does
  not match the g-tree, the contents of the DOM will be overriden and a warning
  will be printed to the console. 


Note that Goon TS uses the globally registered `window` and `document` values. 