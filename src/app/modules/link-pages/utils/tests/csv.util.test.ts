import { describe, expect, it } from 'vitest';
import { toCsv } from '../csv.util';

describe('toCsv', () => {
  it('quotes cells, escapes quotes and neutralizes formulas', () => {
    expect(
      toCsv([
        ['Nome', 'Obs'],
        ['Ana "A"', '=HYPERLINK("x")'],
        [null, true],
      ]),
    ).toBe(
      String.fromCharCode(0xfeff) +
        '"Nome";"Obs"\r\n"Ana ""A""";"\'=HYPERLINK(""x"")"\r\n"";"true"',
    );
  });
});
