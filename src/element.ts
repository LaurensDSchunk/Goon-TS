import { effect, type Ref } from "./reactive";

type Tags = keyof HTMLElementTagNameMap;
type Props<Tag extends Tags> = Partial<
  Record<keyof Omit<HTMLElementTagNameMap[Tag], "style">, any>
> &
  Record<string, any>;
type Style = Partial<Record<keyof CSSStyleDeclaration, any>>;

let hydrating = false;

/**
 * If the value is a function, runs it and unwraps it if it's a ref
 * If the value is a ref, unwraps it (returns value.value)
 *
 * TLDR: Normalizes children to be used in the HTML
 *
 * @param value Anything to potentially be unwrapped
 */
function unwrap(value: any) {
  if (typeof value === "function") {
    value = value();
  }

  // If it's a ref
  if (typeof value === "object" && "value" in value) {
    return value.value;
  }

  return value;
}

export class GoonElement<Tag extends Tags = any> {
  private m_tag: Tag;
  private m_props: Props<Tag> = {};
  private m_style: Style = {};
  private m_children: any = [];
  private m_ref: Ref<HTMLElement> = null!;
  private m_eventListeners: Map<string, () => any> = new Map();

  /*
   * Accounted for children types:
   * - Array of any, including reactive, refs(.value is extracted automatically)
   * A single value, which will be put into an array.
   * @param tag
   */

  public constructor(tag: Tag) {
    this.m_tag = tag;
  }

  public props(props: Props<Tag>): GoonElement {
    this.m_props = props;
    return this;
  }

  public style(style: Style): GoonElement {
    this.m_style = style;
    return this;
  }

  public children(children: any): GoonElement {
    this.m_children = children;
    return this;
  }

  public ref(val: Ref<HTMLElement>) {
    this.m_ref = val;
    return this;
  }

  public mount(querySelector: string) {
    const mountElement = document.querySelector(querySelector);
    if (!mountElement)
      throw new Error(
        "The mount element specified with the query selector does not exist!"
      );

    if (mountElement.children.length !== 0) hydrating = true;

    this.render(mountElement, 0);

    hydrating = false;
  }

  public render(parent: Element, childNumber: number) {
    let element = parent.children[childNumber] as HTMLElement;
    if (!element) {
      if (hydrating) console.warn("Hydration mismatch detected")
      element = document.createElement(this.m_tag);
      parent.appendChild(element);
    }
    if (element.tagName.toLowerCase() !== this.m_tag) {
      if (hydrating) console.warn("Hydration mismatch detected")
      const newElement = document.createElement(this.m_tag);
      element.replaceWith(newElement);
      element = newElement;
    }

    if (this.m_ref) {
      this.m_ref.value = element;
    }

    // Children
    effect(() => {
      const children = unwrap(this.m_children);

      for (let i = 0; i < children.length; i++) {
        let child = children[i];

        if (!(child instanceof GoonElement)) {
          child = new GoonElement("span").props({ innerText: child }).style({whiteSpace: "pre"});
        }

        // Recursivley render Elements
        if (child instanceof GoonElement) {
          child.render(element, i);
          continue;
        }
      }
    });

    for (const key in this.m_props) {
      const value = this.m_props[key];

      // Functions
      if (key.startsWith("on") && typeof value === "function") {
        const event = key.slice(2).toLowerCase();

        const existingListener = this.m_eventListeners.get(event)
        if (existingListener) element.removeEventListener(event, existingListener)

        element.addEventListener(event, value);
        this.m_eventListeners.set(event, value)
        continue;
      }

      effect(() => {
        if (key in element) {
          // @ts-ignore
          element[key] = unwrap(value);
        } else {
          element.setAttribute(key, unwrap(value));
        }
      });
    }

    for (const key in this.m_style) {
      effect(() => {
        const value = this.m_style[key]!;
        element.style[key] = unwrap(value);
      });
    }
  }
}