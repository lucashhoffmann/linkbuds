import type { CSSProperties } from 'react';
import type {
  TextRun,
  TextRunSize,
} from '../types/link-pages.types';

export const textRunSizeOptions: Array<{ value: TextRunSize; label: string }> =
  [
    { value: 'SM', label: 'Pequeno' },
    { value: 'MD', label: 'Normal' },
    { value: 'LG', label: 'Grande' },
    { value: 'XL', label: 'Título' },
  ];

const sizeRem: Record<TextRunSize, string> = {
  SM: '0.875rem',
  MD: '1rem',
  LG: '1.25rem',
  XL: '1.5rem',
};

// execCommand('fontSize') speaks 1–7 (`<font size>` or CSS keywords with styleWithCSS).
export const execFontSize: Record<TextRunSize, string> = {
  SM: '2',
  MD: '3',
  LG: '5',
  XL: '6',
};
const sizeByFontAttr: Record<string, TextRunSize> = {
  '1': 'SM',
  '2': 'SM',
  '3': 'MD',
  '4': 'LG',
  '5': 'LG',
  '6': 'XL',
  '7': 'XL',
};
const sizeByKeyword: Record<string, TextRunSize> = {
  'x-small': 'SM',
  small: 'SM',
  medium: 'MD',
  large: 'LG',
  'x-large': 'LG',
  'xx-large': 'XL',
  'xxx-large': 'XL',
};
const sizeByRem = Object.fromEntries(
  Object.entries(sizeRem).map(([size, rem]) => [rem, size as TextRunSize]),
);

export function textRunStyle(run: TextRun): CSSProperties {
  return {
    fontWeight: run.bold ? 700 : undefined,
    fontStyle: run.italic ? 'italic' : undefined,
    color: run.color,
    fontSize: run.size ? sizeRem[run.size] : undefined,
  };
}

export function textRunsToPlain(runs: TextRun[]) {
  return runs.map((run) => run.text).join('');
}

function toHex(color: string) {
  const value = color.trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toUpperCase();
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${[...value.slice(1)].map((c) => c + c).join('')}`.toUpperCase();
  }
  const rgb = value.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!rgb) return undefined;
  return `#${rgb
    .slice(1, 4)
    .map((part) => Number(part).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
}

type RunStyle = Omit<TextRun, 'text'>;

function styleOf(element: HTMLElement, inherited: RunStyle): RunStyle {
  const style = { ...inherited };
  const tag = element.tagName;
  if (tag === 'B' || tag === 'STRONG') style.bold = true;
  if (tag === 'I' || tag === 'EM') style.italic = true;

  const weight = element.style.fontWeight;
  if (weight) style.bold = weight === 'bold' || Number(weight) >= 600;
  const fontStyle = element.style.fontStyle;
  if (fontStyle) style.italic = fontStyle === 'italic';

  const color = element.style.color || element.getAttribute('color');
  const hex = color ? toHex(color) : undefined;
  if (hex) style.color = hex;

  const size =
    sizeByRem[element.style.fontSize] ??
    sizeByKeyword[element.style.fontSize] ??
    (tag === 'FONT' ? sizeByFontAttr[element.getAttribute('size') ?? ''] : undefined);
  if (size) style.size = size;

  return style;
}

/**
 * Reads a contentEditable tree back into runs. Handles our own spans plus
 * whatever execCommand/browsers emit (`b`, `font`, inline styles, `div`/`br`
 * for Enter). Text is copied as text: no markup survives.
 */
export function domToTextRuns(root: HTMLElement): TextRun[] {
  const runs: TextRun[] = [];
  const push = (text: string, style: RunStyle) => {
    if (!text) return;
    const clean: TextRun = { text };
    if (style.bold) clean.bold = true;
    if (style.italic) clean.italic = true;
    if (style.color) clean.color = style.color;
    if (style.size && style.size !== 'MD') clean.size = style.size;
    const last = runs.at(-1);
    if (
      last &&
      last.bold === clean.bold &&
      last.italic === clean.italic &&
      last.color === clean.color &&
      last.size === clean.size
    ) {
      last.text += text;
    } else {
      runs.push(clean);
    }
  };
  const endsWithBreak = () => !runs.length || runs.at(-1)!.text.endsWith('\n');

  const walk = (node: Node, style: RunStyle) => {
    if (node.nodeType === Node.TEXT_NODE) {
      push(node.textContent ?? '', style);
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.tagName === 'BR') {
      push('\n', style);
      return;
    }
    const block = node.tagName === 'DIV' || node.tagName === 'P';
    if (block && !endsWithBreak()) push('\n', style);
    const next = styleOf(node, style);
    node.childNodes.forEach((child) => walk(child, next));
  };

  root.childNodes.forEach((child) => walk(child, {}));

  // Browsers leave a trailing <br> in empty lines; drop the final one.
  const last = runs.at(-1);
  if (last?.text.endsWith('\n')) {
    last.text = last.text.slice(0, -1);
    if (!last.text) runs.pop();
  }
  return runs;
}
