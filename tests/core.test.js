const assert = require('node:assert/strict');
const { test } = require('node:test');
require('../core.js');
const C = globalThis.FairTurnCore;
function fixture(ids, present = [true, true, true]) {
  const s = C.make(['01', '02', '03']);
  s.students.forEach((p, i) => p.present = present[i]);
  s.events = ids.map((id, i) => ({ id, outcome: i % 2 ? 'pass' : 'shared', time: new Date().toISOString() }));
  return s;
}
test('issue #1: the last student remains eligible when uniquely least invited', () => {
  const s = fixture(['s1', 's1', 's0'], [true, true, false]);
  assert.deepEqual(C.candidates(s).map(p => p.id), ['s0']);
  assert.equal(C.draw(s).id, 's0');
  C.resolve(s, 'pass');
  assert.deepEqual(C.candidates(s).map(p => p.id), ['s1']);
});
test('avoid the last student only within tied minimum candidates', () => {
  const s = fixture(['s2', 's2', 's0', 's1']);
  assert.deepEqual(C.candidates(s).map(p => p.id), ['s0']);
});
test('absent students are excluded; a returning student catches up', () => {
  const s = fixture(['s0', 's1', 's0', 's1'], [true, true, false]);
  assert.deepEqual(C.candidates(s).map(p => p.id), ['s0']);
  s.students[2].present = true;
  assert.deepEqual(C.candidates(s).map(p => p.id), ['s2']);
  C.draw(s); C.resolve(s, 'shared');
  assert.deepEqual(C.candidates(s).map(p => p.id), ['s2']);
});
test('single present student can repeat; no present students cannot draw', () => {
  const s = fixture(['s0'], [true, false, false]);
  assert.equal(C.draw(s).id, 's0');
  C.resolve(s, 'shared');
  s.students[0].present = false;
  assert.deepEqual(C.candidates(s), []);
  assert.throws(() => C.draw(s), /No students present/);
});
test('tied candidates remain available to random selection', () => {
  assert.equal(C.draw(C.make(['01', '02', '03']), () => 0).id, 's0');
  assert.equal(C.draw(C.make(['01', '02', '03']), () => .99).id, 's2');
});
test('every draw has the global minimum count across changing attendance', () => {
  const s = C.make(['01', '02', '03', '04']);
  for (let turn = 0; turn < 120; turn++) {
    s.students.forEach((p, i) => p.present = i === 0 || (turn + i) % 5 !== 0);
    const min = Math.min(...s.students.filter(p => p.present).map(p => C.counts(s, p.id).offered));
    const selected = C.draw(s, () => (turn % 10) / 10);
    assert.equal(C.counts(s, selected.id).offered, min);
    C.resolve(s, turn % 2 ? 'pass' : 'shared');
  }
});
