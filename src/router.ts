import type { GoonElement } from "./GoonElement";
import { g } from "./g";
import { effect, ref, type Ref } from "./reactive";

export type RouteMap = Record<string, GoonElement> & { notFound?: GoonElement };

const currentRoute: Ref<string> = ref(window.location.pathname);
const currentRouteElement = ref<GoonElement>(null!);

window.addEventListener("popstate", () => {
  currentRoute.value = window.location.pathname;
});

export function RouterView(map: RouteMap): Ref<GoonElement> {
  effect(() => {
    let routeElement = map[currentRoute.value];

    if (routeElement === undefined) {
      if (map.notFound) routeElement = map.notFound;
    }

    currentRouteElement.value = routeElement!;
  });

  return currentRouteElement;
}

export function RouterLink(to: string) {
  return g.a().props({
    href: to,
    onclick: (e: Event) => {
      e.preventDefault();
      useRouter().push(to);
    },
  });
}

export function useRouter() {
  return {
    push(location: string) {
      if (currentRoute.value !== location) history.pushState({}, "", location);
      currentRoute.value = location;
    },

    replace(location: string) {
      if (currentRoute.value !== location) history.pushState({}, "", location);
      currentRoute.value = location;
    },
  };
}
