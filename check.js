// check.js - simple "build" check for CI: files exist, are linked, and JS has no syntax errors
const fs = require('fs');
const { execFileSync } = require('child_process');

const required = ['index.html', 'style.css', 'script.js', 'calc.js'];
let ok = true;

for (const f of required) {
  if (!fs.existsSync(f)) { console.error('Missing file: ' + f); ok = false; }
}
if (ok) {
  const html = fs.readFileSync('index.html', 'utf8');
  for (const f of ['style.css', 'calc.js', 'script.js']) {
    if (!html.includes(f)) { console.error('index.html does not link ' + f); ok = false; }
  }
  for (const f of ['calc.js', 'script.js', 'test.js']) {
    try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
    catch (e) { console.error('Syntax error in ' + f + '\n' + e.stderr); ok = false; }
  }
}
if (!ok) process.exit(1);
console.log('Build check passed');
