import type { GoonNode } from "./GoonNode";
import { effect, type Ref } from "./reactive";
import { GoonText } from "./GoonText";
import { unwrap } from "./utils";

type Tags = keyof HTMLElementTagNameMap;
type Props<Tag extends Tags> = Partial<
  Record<keyof Omit<HTMLElementTagNameMap[Tag], "style">, any>
> &
  Record<string, any>;
type Style = Partial<Record<keyof CSSStyleDeclaration, any>>;

export class GoonElement<Tag extends Tags = any> implements GoonNode {
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

    mountElement.appendChild(this.render());
  }

  public render(): Node {
    let element = document.createElement(this.m_tag) as HTMLElement;

    // Assign the ref
    if (this.m_ref) {
      this.m_ref.value = element;
    }

    // Children
    effect(() => {
      let children = unwrap(this.m_children);
      if (!(children instanceof Array)) children = [children]
      element.childNodes.forEach(node => element.removeChild(node))

      for (let i = 0; i < children.length; i++) {
        let child = children[i];

        if (!(child instanceof GoonElement)) {
          child = new GoonText(child);
          element.appendChild((child as GoonText).render())
        }

        // Recursivley render Elements
        if (child instanceof GoonElement) {
          element.appendChild(child.render());
          continue;
        }
      }
    });

    effect(() => {
      for (const key in this.m_props) {
        const value = this.m_props[key];

        // Functions
        if (key.startsWith("on") && typeof value === "function") {
          const event = key.slice(2).toLowerCase();

          const existingListener = this.m_eventListeners.get(event);
          if (existingListener)
            element.removeEventListener(event, existingListener);

          element.addEventListener(event, value);
          this.m_eventListeners.set(event, value);
          continue;
        }

        effect(() => {
          if (key in element) {
            // @ts-ignore
            element[key] = String(unwrap(value));
          } else {
            element.setAttribute(key, String(unwrap(value)));
          }
        });
      }
    });

    for (const key in this.m_style) {
      effect(() => {
        const value = this.m_style[key]!;
        element.style[key] = unwrap(value);
      });
    }

    return element;
  }
}
