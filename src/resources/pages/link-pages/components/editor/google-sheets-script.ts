/**
 * Apps Script the agency pastes into the sheet (Extensões → Apps Script) and
 * deploys as a web app. LinkBuds POSTs `{form, submissionId, columns, row}`.
 * One tab per form; new fields become new columns; the ID column makes a
 * resend idempotent; values starting with = + - @ are kept as text.
 */
export const googleSheetsScript = `// LinkBuds → Google Sheets
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var book = SpreadsheetApp.getActiveSpreadsheet();
    var name = String(data.form.name).replace(/[\\[\\]*?:\\/\\\\]/g, ' ').slice(0, 90);
    var sheet = book.getSheetByName(name) || book.insertSheet(name);
    var columns = data.columns.concat(['ID']);
    var values = data.row.concat([data.submissionId]);

    var header = sheet.getLastColumn()
      ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      : [];
    columns.forEach(function (column) {
      if (header.indexOf(column) === -1) header.push(column);
    });
    sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sheet.setFrozenRows(1);

    var idColumn = header.indexOf('ID') + 1;
    var lastRow = sheet.getLastRow();
    var exists = lastRow > 1 && sheet
      .getRange(2, idColumn, lastRow - 1, 1)
      .createTextFinder(data.submissionId)
      .matchEntireCell(true)
      .findNext();

    if (!exists) {
      var line = header.map(function (column) {
        var index = columns.indexOf(column);
        var value = index === -1 ? '' : values[index];
        if (column === 'Data' && value) return new Date(value);
        if (typeof value === 'string' && /^[=+\\-@]/.test(value)) return "'" + value;
        return value === null ? '' : value;
      });
      sheet.appendRow(line);
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
`;
