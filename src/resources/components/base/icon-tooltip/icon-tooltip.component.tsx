import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const TARGET = 'button, a, [role="button"]';
const GAP = 8;

type Tip = { label: string; x: number; y: number; below: boolean };

/** Label de elemento só-ícone (sem texto visível). Explícito via data-tooltip força. */
function labelOf(el: HTMLElement): string | null {
  if (el.closest('[data-slot="tooltip-trigger"]')) return null; // já usa Radix Tooltip
  // Move title nativo para data-tooltip: evita tooltip duplicado do browser.
  const title = el.getAttribute('title');
  if (title) {
    el.dataset.tooltip ??= title;
    el.removeAttribute('title');
  }
  if (el.dataset.tooltip) return el.dataset.tooltip;
  if (el.textContent?.trim()) return null;
  const label = el.getAttribute('aria-label');
  if (!label && import.meta.env.DEV) {
    console.warn(
      'Botão só-ícone sem aria-label/title (tooltip obrigatório):',
      el,
    );
  }
  return label;
}

/**
 * Tooltip global: todo botão/link só-ícone da aplicação mostra legenda ao
 * passar o mouse ou focar via teclado, usando aria-label/title/data-tooltip.
 */
export function IconTooltip() {
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    let current: HTMLElement | null = null;

    const show = (el: HTMLElement) => {
      const label = labelOf(el);
      if (!label) return hide();
      current = el;
      const r = el.getBoundingClientRect();
      const below = r.top < 40;
      setTip({
        label,
        x: r.left + r.width / 2,
        y: below ? r.bottom + GAP : r.top - GAP,
        below,
      });
    };
    const hide = () => {
      current = null;
      setTip(null);
    };

    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const el = (e.target as Element).closest<HTMLElement>(TARGET);
      if (el === current) return;
      if (el) show(el);
      else hide();
    };
    const onFocus = (e: FocusEvent) => {
      const el = (e.target as Element).closest?.<HTMLElement>(TARGET);
      if (el?.matches(':focus-visible')) show(el);
    };

    document.addEventListener('pointerover', onOver);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', hide);
    document.addEventListener('pointerdown', hide);
    window.addEventListener('scroll', hide, true);
    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', hide);
      document.removeEventListener('pointerdown', hide);
      window.removeEventListener('scroll', hide, true);
    };
  }, []);

  if (!tip) return null;
  return createPortal(
    <div
      role='tooltip'
      style={{ left: tip.x, top: tip.y }}
      className={`bg-foreground text-background animate-in fade-in-0 zoom-in-95 pointer-events-none fixed z-[90] w-max max-w-60 -translate-x-1/2 rounded-md px-3 py-1.5 text-xs text-balance ${tip.below ? '' : '-translate-y-full'}`}
    >
      {tip.label}
    </div>,
    document.body,
  );
}
