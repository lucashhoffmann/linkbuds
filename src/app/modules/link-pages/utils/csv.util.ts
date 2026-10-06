/**
 * `;`-separated CSV with BOM: opens straight in pt-BR Excel. Cells starting
 * with = + - @ get a `'` so visitor input can't run as a spreadsheet formula.
 */
const BOM = String.fromCharCode(0xfeff);

export function toCsv(rows: Array<Array<string | number | boolean | null>>) {
  const cell = (value: string | number | boolean | null) => {
    const text = value === null ? '' : String(value);
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;

    return `"${safe.replaceAll('"', '""')}"`;
  };

  return `${BOM}${rows.map((row) => row.map(cell).join(';')).join('\r\n')}`;
}

export function downloadCsv(
  filename: string,
  rows: Array<Array<string | number | boolean | null>>,
) {
  const url = URL.createObjectURL(
    new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
