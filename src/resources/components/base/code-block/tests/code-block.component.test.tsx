import { describe, expect, it } from 'vitest';
import { googleSheetsScript } from '@/resources/pages/link-pages/components/editor/google-sheets-script';
import { tokenizeJs } from '../code-block.component';

describe('tokenizeJs', () => {
  it('keeps the source intact', () => {
    expect(
      tokenizeJs(googleSheetsScript)
        .map((token) => token.text)
        .join(''),
    ).toBe(googleSheetsScript);
  });

  it('tells regex, string, comment and division apart', () => {
    const typed = (code: string) =>
      tokenizeJs(code)
        .filter((token) => token.type !== 'plain')
        .map((token) => `${token.type}:${token.text}`);

    expect(
      typed(`// nota\nif (x && /^[=+\\-@]/.test("'")) return a / 2;`),
    ).toEqual([
      'comment:// nota',
      'keyword:if',
      'regex:/^[=+\\-@]/',
      'call:test',
      `string:"'"`,
      'keyword:return',
      'number:2',
    ]);
  });
});
