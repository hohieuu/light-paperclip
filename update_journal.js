const fs = require('fs');
const journalPath = 'packages/db/src/migrations/meta/_journal.json';
const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
journal.entries.push({
  idx: journal.entries.length,
  version: "7",
  when: Date.now(),
  tag: "0048_seed_global_company",
  breakpoints: true
});
fs.writeFileSync(journalPath, JSON.stringify(journal, null, 2) + '\n');
