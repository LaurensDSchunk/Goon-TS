import { effect } from "./reactive";

type Tags = keyof HTMLElementTagNameMap;
type Props<Tag extends Tags> = Partial<
  Record<keyof Omit<HTMLElementTagNameMap[Tag], "style">, any>
> &
  Record<string, any>;
type Style = Partial<Record<keyof CSSStyleDeclaration, any>>;

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

  public mount(querySelector: string) {
    const mountElement = document.querySelector(querySelector)
    if (!mountElement) throw new Error("The mount element specified with the query selector does not exist!")

    mountElement.appendChild(this.render());
  }

  public render(): HTMLElement {
    const element = document.createElement(this.m_tag);

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

    for (const key in this.m_style) {
      const value = this.m_style[key];

      effect(() => {
        const value = this.m_style[key]!;
        element.style[key] = unwrap(value);
      });
    }

    effect(() => {
      const children = unwrap(this.m_children);

      // Clear the existing children if child array has changed
      element.innerHTML = "";
      element.innerText = "";

      // Children
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // Recursivley render Elements
        if (child instanceof GoonElement) {
          element.appendChild(child.render());
          continue;
        }

        let span = document.createElement("span");
        element.appendChild(span);
        effect(() => {
          const val = unwrap(child);

          // Handles elements from functions or refs
          if (val instanceof GoonElement) {
            const newElement = val.render();
            span.replaceWith(newElement);
            span = newElement;
            return;
          }

          span.innerText = String(val);
        });
      }
    });

    return element;
  }
}
