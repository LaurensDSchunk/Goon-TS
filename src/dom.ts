let _document: Document;
let _window: Window;

export const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

if (isBrowser) {
  // Browser environment — use real DOM
  _window = window;
  _document = document;
} else {
  // SSR environment — dynamically load happy-dom
  const { Window: HappyWindow } = await import("happy-dom");
  const happyWindow = new HappyWindow();

  _window = happyWindow as unknown as Window;
  _document = happyWindow.document as unknown as Document;
}

export { _window as window, _document as document };