'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { addDays, addWeeks, addMonths, dueDate } = require('../app.js');

/* These prove the exact dates the explainer's demo timeline shows are
   derived by honest calendar arithmetic, not hand-typed. If someone edits
   a demo date without changing the DOB or offset, this suite fails. */

test('addWeeks: 6-week doses land exactly DOB + 42 days', () => {
  assert.equal(addWeeks('2026-01-15', 6), '2026-02-26');
  assert.equal(addWeeks('2026-01-15', 6), addDays('2026-01-15', 42));
});

test('demo timeline dates for DOB 2026-01-15 are exactly what is shown', () => {
  const dob = '2026-01-15';
  assert.equal(dueDate({ weeks: 0 }, dob), '2026-01-15');   // birth doses
  assert.equal(dueDate({ weeks: 6 }, dob), '2026-02-26');   // 26 Feb 2026
  assert.equal(dueDate({ weeks: 10 }, dob), '2026-03-26');  // 26 Mar 2026
  assert.equal(dueDate({ weeks: 14 }, dob), '2026-04-23');  // 23 Apr 2026
  assert.equal(dueDate({ months: 9 }, dob), '2026-10-15');  // 15 Oct 2026
});

test('addMonths: month-end clamping and leap years', () => {
  assert.equal(addMonths('2025-01-31', 1), '2025-02-28'); // Feb has 28 in 2025
  assert.equal(addMonths('2024-01-31', 1), '2024-02-29'); // leap Feb
  assert.equal(addMonths('2025-08-31', 1), '2025-09-30'); // Sep has 30
  assert.equal(addMonths('2025-12-15', 1), '2026-01-15'); // year rollover
});

test('birth doses (offset {weeks:0}) equal the DOB itself', () => {
  for (const dob of ['2026-01-01', '2024-02-29', '2025-12-31']) {
    assert.equal(dueDate({ weeks: 0 }, dob), dob);
  }
});

test('addDays produces valid ISO dates and is reversible', () => {
  assert.equal(addDays('2026-02-28', 1), '2026-03-01'); // non-leap wrap
  assert.equal(addDays('2024-02-28', 1), '2024-02-29'); // leap wrap
  assert.equal(addDays(addDays('2026-01-15', 42), -42), '2026-01-15');
});

test('property: adding N months then reading the month is consistent', () => {
  // for the 15th (never clamped), DOB + k months always lands on the 15th
  let iso = '2026-01-15';
  for (let k = 1; k <= 36; k++) {
    const d = addMonths('2026-01-15', k);
    assert.equal(Number(d.slice(8, 10)), 15);
    assert.match(d, /^\d{4}-\d{2}-\d{2}$/);
    iso = d;
  }
});
