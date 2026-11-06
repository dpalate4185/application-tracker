/**
 * Application Tracker — Google Sheet backend
 *
 * Paste this whole file into Extensions → Apps Script of your private Google Sheet.
 * 1. Change PASSCODE below to your own long passcode (e.g. four random words).
 * 2. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
 * 3. Copy the Web app URL (ends in /exec) and paste it into the tracker site with your passcode.
 *
 * "Anyone" only means the site can reach this script without a Google login.
 * Every request must carry the correct passcode, or the script returns nothing.
 */

const PASSCODE = 'CHANGE-ME-to-four-random-words';   // <-- change this
const SHEET_NAME = 'Applications';

const COLUMNS = ['id', 'company', 'role', 'status', 'type', 'applied', 'followUp',
  'location', 'mode', 'source', 'resume', 'salary', 'contact', 'link', 'notes',
  'createdAt', 'updatedAt'];

const HEADERS = ['ID', 'Company', 'Role', 'Status', 'Job type', 'Date applied', 'Follow up on',
  'Location', 'Work mode', 'Source', 'Resume version', 'Pay / salary', 'Contact', 'Job link', 'Notes',
  'Created', 'Last updated'];

function doPost(e) {
  let req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: 'bad_request' });
  }
  if (PASSCODE.indexOf('CHANGE-ME') === 0) {
    return reply({ ok: false, error: 'passcode_not_set' });
  }
  if (!req || req.key !== PASSCODE) {
    Utilities.sleep(800); // slow down guessing
    return reply({ ok: false, error: 'unauthorized' });
  }

  const sheet = getSheet();
  try {
    switch (req.action) {
      case 'list':
        return reply({ ok: true, apps: readAll(sheet) });
      case 'save':
        return withLock(() => reply({ ok: true, app: saveOne(sheet, req.app) }));
      case 'delete':
        return withLock(() => { deleteOne(sheet, req.id); return reply({ ok: true }); });
      case 'ping':
        return reply({ ok: true });
      default:
        return reply({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    return reply({ ok: false, error: 'server_error', message: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput('Application Tracker backend is running. Use the tracker website to connect.');
}

/* ---------- helpers ---------- */

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function withLock(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
  }
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), COLUMNS.length).setNumberFormat('@'); // keep everything as plain text
  }
  return sh;
}

function cell(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return v === null || v === undefined ? '' : String(v);
}

function readAll(sh) {
  const last = sh.getLastRow();
  if (last < 2) return [];
  const values = sh.getRange(2, 1, last - 1, COLUMNS.length).getValues();
  return values
    .filter(r => r[0])
    .map(r => {
      const o = {};
      COLUMNS.forEach((c, i) => { o[c] = cell(r[i]); });
      return o;
    });
}

function findRow(sh, id) {
  const last = sh.getLastRow();
  if (last < 2 || !id) return -1;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

function saveOne(sh, app) {
  if (!app || typeof app !== 'object') throw new Error('missing app');
  const now = new Date().toISOString();
  const rowNum = findRow(sh, app.id);
  const rec = {};
  COLUMNS.forEach(c => { rec[c] = app[c] === undefined || app[c] === null ? '' : String(app[c]).slice(0, 5000); });
  rec.updatedAt = now;
  if (rowNum === -1) {
    rec.id = rec.id || Utilities.getUuid();
    rec.createdAt = rec.createdAt || now;
    const r = sh.getLastRow() + 1;
    const range = sh.getRange(r, 1, 1, COLUMNS.length);
    range.setNumberFormat('@');
    range.setValues([COLUMNS.map(c => rec[c])]);
  } else {
    const existing = sh.getRange(rowNum, 1, 1, COLUMNS.length).getValues()[0];
    rec.createdAt = cell(existing[COLUMNS.indexOf('createdAt')]) || now;
    const range = sh.getRange(rowNum, 1, 1, COLUMNS.length);
    range.setNumberFormat('@');
    range.setValues([COLUMNS.map(c => rec[c])]);
  }
  return rec;
}

function deleteOne(sh, id) {
  const rowNum = findRow(sh, id);
  if (rowNum > 0) sh.deleteRow(rowNum);
}
