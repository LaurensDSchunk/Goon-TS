import type { GoonNode } from "./GoonNode";
import { effect, type Ref } from "./reactive";
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

    mountElement.appendChild(this.render());
  }

  public ref(val: Ref<Text>) {
    this.m_ref = val;
    return this;
  }

  public render(): Text {
    let node = document.createTextNode("");

    if (this.m_ref) {
      this.m_ref.value = node;
    }

    effect(() => {
      node.textContent = String(unwrap(this.m_text));
    });

    return node;
  }
}
