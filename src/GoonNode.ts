export interface GoonNode {
  mount(querySelector: string): void;
  render(parent: Element, childNumber: number): void
}