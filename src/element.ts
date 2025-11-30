import { effect, type Reactive, type Ref } from "./reactive";

type StyleProps = Partial<Record<keyof CSSStyleDeclaration, MaybeRef<string>>>;
type ElementProps<Tag extends keyof HTMLElementTagNameMap> = Partial<
  Omit<HTMLElementTagNameMap[Tag], "style">
> &
  Record<string, MaybeRef<any>>;
export type Child = Element | string | (() => any) | Ref<any>;
type MaybeRef<T> = T | Ref<T> | Reactive<T>;

// Turns a ref into its primitive and does nothing to reactive or primitives
function unwrap<T>(val: MaybeRef<T>) {
  if (val && typeof val === "object" && "value" in val) {
    return (val as Ref<T>).value;
  }
  return val as T;
}

export class Element<Tag extends keyof HTMLElementTagNameMap = any> {
  private m_tag: Tag;
  private m_props: ElementProps<Tag> & {style?: StyleProps} = {};
  private m_children: Child[] = [];

  public constructor(tag: Tag) {
    this.m_tag = tag;
  }

  public props(props: ElementProps<Tag>) {
    this.m_props = props;
    return this;
  }

  public style(style: StyleProps) {
    this.m_props.style = style;
    return this;
  }

  public children(children: Child[]) {
    this.m_children = children;
    return this;
  }

  public mount(elementId: string) {
    const mountElement = document.getElementById(elementId);
    mountElement?.appendChild(this.render());
  }

  private render(): HTMLElement {
    const element = document.createElement(this.m_tag);

    // Apply styles
    for (const key in this.m_props.style ?? {}) {
      effect(() => {
        const value = this.m_props.style![key]!;
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
    for (const child of this.m_children) {
      if (child instanceof Element) {
        const childElement = child.render();
        element.appendChild(childElement);
        continue;
      }

      // If child is a Ref<Element>
      if (
        child &&
        typeof child === "object" &&
        "value" in child &&
        child.value instanceof Element
      ) {
        let placeholder = document.createElement("span"); // temporary container
        element.appendChild(placeholder);

        effect(() => {
          const newElement = child.value.render();
          placeholder.replaceWith(newElement);
          placeholder = newElement;
        });
        continue;
      }

      // Handle string, ref, and function children
      const span = document.createElement("span");
      effect(() => {
        const value = typeof child === "function" ? child() : unwrap(child);
        span.innerText = unwrap(value);
      });
      element.appendChild(span);
      continue;
    }

    return element;
  }
}