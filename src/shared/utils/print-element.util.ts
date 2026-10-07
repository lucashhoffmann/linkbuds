/**
 * Print one element in a clean window with the app styles; the user saves it
 * as PDF. Returns false when the browser blocked the pop-up.
 */
export function printElement(element: HTMLElement, title: string) {
  const win = window.open('', '_blank');
  if (!win) return false;

  const styles = [...document.querySelectorAll('style, link[rel="stylesheet"]')]
    .map((node) =>
      node instanceof HTMLLinkElement
        ? `<link rel="stylesheet" href="${node.href}">`
        : node.outerHTML,
    )
    .join('');
  win.document.write(
    `<!doctype html><html class="${document.documentElement.className}"><head><title>${title}</title>${styles}</head><body class="p-6">${element.outerHTML}</body></html>`,
  );
  win.document.close();
  win.addEventListener('load', () => {
    win.print();
    win.close();
  });

  return true;
}
