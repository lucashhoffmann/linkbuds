import { describe, expect, it } from 'vitest';
import { domToTextRuns } from '../text-runs.util';

function editor(html: string) {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}

describe('domToTextRuns', () => {
  it('reads execCommand output (tags, CSS, font) into merged runs', () => {
    expect(
      domToTextRuns(
        editor(
          'Oi <b>forte</b><span style="font-weight: bold">!</span> <i>it</i>' +
            '<span style="color: rgb(255, 0, 0); font-size: x-large">big</span>' +
            '<font color="#00ff00" size="2">sm</font>',
        ),
      ),
    ).toEqual([
      { text: 'Oi ' },
      { text: 'forte!', bold: true },
      { text: ' ' },
      { text: 'it', italic: true },
      { text: 'big', color: '#FF0000', size: 'LG' },
      { text: 'sm', color: '#00FF00', size: 'SM' },
    ]);
  });

  it('turns Enter divs/br into line breaks and keeps markup as text', () => {
    expect(
      domToTextRuns(editor('a<div>b</div><div><br></div><div>&lt;b&gt;</div>')),
    ).toEqual([{ text: 'a\nb\n\n<b>' }]);
  });

  it('round-trips the spans the editor renders on load', () => {
    expect(
      domToTextRuns(
        editor(
          '<span style="font-weight: 700; font-style: italic; font-size: 1.5rem">T</span>' +
            '<span style="font-weight: normal">x</span>',
        ),
      ),
    ).toEqual([{ text: 'T', bold: true, italic: true, size: 'XL' }, { text: 'x' }]);
  });
});
