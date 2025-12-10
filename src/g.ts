import { GoonElement } from "./GoonElement";
import { RouterLink, RouterView } from "./router";
import { GoonText } from "./GoonText";

type HtmlBuilder = {
  [K in keyof HTMLElementTagNameMap]: () => GoonElement<K>;
};

type TextBuilder = {
  text: (value: any) => GoonText;
}

const components = {
  RouterLink,
  RouterView
}; // Custom components are put here

type CustomComponents = {
  [K in keyof typeof components]: (typeof components)[K];
};

export const g: HtmlBuilder & CustomComponents & TextBuilder = new Proxy({} as any, {
  get(_, tag: string) {
    if (tag === "text") return (value: any) => new GoonText(value)
    if (tag in components) return components[tag as keyof typeof components];

    return () => new GoonElement(tag as keyof HTMLElementTagNameMap);
  },
});