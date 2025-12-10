/**
 * If the value is a function, runs it and unwraps it if it's a ref
 * If the value is a ref, unwraps it (returns value.value)
 *
 * TLDR: Normalizes children to be used in the HTML
 *
 * @param value Anything to potentially be unwrapped
 */
export function unwrap(value: any) {
  if (typeof value === "function") {
    value = value();
  }

  // If it's a ref
  if (typeof value === "object" && "value" in value) {
    return value.value;
  }

  return value;
}