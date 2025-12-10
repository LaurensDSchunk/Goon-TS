import type { GoonNode } from "./GoonNode";
import { effect, ref, type Ref } from "./reactive";
import { unwrap } from "./utils";

export class GoonText implements GoonNode {
  private m_text: any;
  private m_ref: Ref<Text> = null!;

  public constructor(text: any) {
    this.m_text = text;
  }

  public mount(querySelector: string) {
    const mountElement = document.querySelector(querySelector);
    if (!mountElement)
      throw new Error(
        "The mount element specified with the query selector does not exist!"
      );

    this.render(mountElement, 0);
  }

  public ref(val: Ref<Text>) {
    this.m_ref = val;
    return this;
  }

  public render(parent: Element, childNumber: number) {
    let node = parent.childNodes[childNumber] as Text;
    if (node && node.nodeType !== Node.TEXT_NODE) {
      const newNode = document.createTextNode("");
      node.replaceWith(newNode);
      node = newNode;
    }
    if (!node) {
      node = document.createTextNode("");
      parent.appendChild(node);
    }

    if (this.m_ref) {
      this.m_ref.value = node;
    }

    effect(() => {
      node.textContent = String(unwrap(this.m_text));
    });
  }
}
