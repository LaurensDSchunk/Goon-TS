import { Element } from "./element";
import { RouterLink, RouterView } from "./router";

/*
 * g contains all of the elements in Goon TS. 
 */

type HtmlBuilder = {
  [K in keyof HTMLElementTagNameMap]: () => Element<K>;
};

const components = {
  routerLink: RouterLink,
  routerView: RouterView
};

type CustomComponents = {
  [K in keyof typeof components]: (typeof components)[K];
};

export const g: HtmlBuilder & CustomComponents = new Proxy({} as any, {
  get(_, tag: string) {
    if (tag in components) return components[tag as keyof typeof components];

    return () => new Element(tag as keyof HTMLElementTagNameMap);
  },
});
