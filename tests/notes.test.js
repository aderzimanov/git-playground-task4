const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert");

const store = require("../lib/store");
const { matches } = store;

const notes = [
  { id: 1, text: "buy milk" },
  { id: 2, text: "call the bank" },
  { id: 3, text: "milk the almonds" },
];

const NOTES_FILE = path.join(__dirname, "..", "notes.json");
let originalNotes;

function writeNotes(data) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(data, null, 2));
}

test.before(() => {
  originalNotes = fs.existsSync(NOTES_FILE) ? fs.readFileSync(NOTES_FILE, "utf8") : null;
});

test.after(() => {
  if (originalNotes === null) {
    fs.rmSync(NOTES_FILE, { force: true });
  } else {
    fs.writeFileSync(NOTES_FILE, originalNotes);
  }
});

test("search finds every note that contains the term", () => {
  const result = matches(notes, "milk");
  assert.strictEqual(result.length, 2);
});

test("search finds a single containing note", () => {
  const result = matches(notes, "bank");
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 2);
});

test("search returns nothing when no note contains the term", () => {
  const result = matches(notes, "xyz");
  assert.strictEqual(result.length, 0);
});

test("edit updates the text of an existing note", () => {
  writeNotes({ nextId: 2, notes: [{ id: 1, text: "old text" }] });
  const result = store.edit(1, "new text");
  assert.strictEqual(result, true);
  const [note] = store.all();
  assert.strictEqual(note.text, "new text");
});

test("edit returns false and leaves notes untouched when the id does not exist", () => {
  writeNotes({ nextId: 1, notes: [] });
  const result = store.edit(999, "anything");
  assert.strictEqual(result, false);
  assert.deepStrictEqual(store.all(), []);
});
