import { document, window } from "./dom";
import { effect, type Reactive, type Ref } from "./reactive";

type Child =
  | any
  | Ref<any>
  | (() => any | Ref<any>); // Computed values
type MaybeRef<T> = T | Ref<T> | Reactive<T>;
type Props<Tag extends keyof HTMLElementTagNameMap> = Partial<Record<keyof Omit<HTMLElementTagNameMap[Tag], "style">, MaybeRef<any>>> & Record<string, any>;
type Style = Partial<Record<keyof CSSStyleDeclaration, MaybeRef<any>>>;


// Runs functions and unwraps refs
function unwrap<T>(val: any) {
  if (typeof val === "function") {
    val = val();
  }
  if (val && typeof val === "object" && "value" in val) {
    return val.value
  }
  return val as T;
}

export class Element<Tag extends keyof HTMLElementTagNameMap = any> {
  private m_tag: Tag;
  private m_props: Props<Tag> = {};
  private m_style: Style = {};
  private m_children: Child[] | Child = [];

  public constructor(tag: Tag) {
    this.m_tag = tag;
  }
  public props(props: Props<Tag>) {
    this.m_props = props;
    return this;
  }
  public style(style: Style) {
    this.m_style = style;
    return this;
  }
  public children(children: Child[] | Child) {
    this.m_children = children;
    return this;
  }

  public mount(querySelector: string) {
    const mountElement = document.querySelector(querySelector)!
    mountElement.appendChild(this.render());
  }

  public render(): HTMLElement {
    const element = document.createElement(this.m_tag);

    // Apply styles
    for (const key in this.m_style) {
      effect(() => {
        const value = this.m_style[key]!;
        element.style[key] = unwrap(value);
      });
    }

    // Apply props
    for (const key in this.m_props) {
      const value = this.m_props[key];

      // Functions
      if (key.startsWith("on") && typeof value === "function") {
        const event = key.slice(2).toLowerCase();
        element.addEventListener(event, value);
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

    // Children
    for (let i = 0; i < this.m_children.length; i++) {
      const child = this.m_children[i];
      // Recursivley render Elements
      if (child instanceof Element) {
        element.appendChild(child.render());
        continue;
      }

      let span = document.createElement("span")
      element.appendChild(span);
      effect(() => {
        const val = unwrap(child);

        // Handles elements from functions or refs
        if (val instanceof Element) {
          const newElement = val.render()
          span.replaceWith(newElement)
          span = newElement
          return;
        }

        span.innerText = String(val)
      })
    }

    return element;
  }
}