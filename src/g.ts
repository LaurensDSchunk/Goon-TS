import { GoonElement } from "./element";

type HtmlBuilder = {
  [K in keyof HTMLElementTagNameMap]: () => GoonElement<K>;
};

const components = {}; // Custom components are put here

type CustomComponents = {
  [K in keyof typeof components]: (typeof components)[K];
};

export const g: HtmlBuilder & CustomComponents = new Proxy({} as any, {
  get(_, tag: string) {
    if (tag in components) return components[tag as keyof typeof components];

    return () => new GoonElement(tag as keyof HTMLElementTagNameMap);
  },
});