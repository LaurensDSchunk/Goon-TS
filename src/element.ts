import { effect, type Reactive, type Ref } from "./reactive";

type StyleProps = Partial<Record<keyof CSSStyleDeclaration, MaybeRef<string>>>;
type ElementProps<Tag extends keyof HTMLElementTagNameMap> = Partial<
  Omit<HTMLElementTagNameMap[Tag], "style">
> &
  Record<string, MaybeRef<any>>;
type Child = Element | string | (() => any) | Ref<any>;
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
  private m_props: ElementProps<Tag> = {};
  private m_style: StyleProps = {};
  private m_children: Child[] = [];

  public constructor(tag: Tag) {
    this.m_tag = tag;
  }

  public props(props: ElementProps<Tag>) {
    this.m_props = props;
    return this;
  }

  public style(style: StyleProps) {
    this.m_style = style;
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

    for (const child of this.m_children) {
      if (!(child instanceof Element)) {
        const span = document.createElement("span");
        effect(() => {
          const value = typeof child === "function" ? child() : unwrap(child)
          span.innerText = unwrap(value);
        });
        element.appendChild(span);
        continue;
      }
      const childElement = child.render();
      element.appendChild(childElement);
    }

    return element;
  }
}

type HtmlBuilder = {
  [K in keyof HTMLElementTagNameMap]: () => Element<K>;
};

export default new Proxy({} as HtmlBuilder, {
  get(_, tag: string) {
    return () => new Element(tag as keyof HTMLElementTagNameMap);
  },
});