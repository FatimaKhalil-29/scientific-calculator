// test.js - simple tests, run with: npm test  (no libraries needed)
const assert = require('assert');
const Calc = require('./calc.js');

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test('addition', () => assert.strictEqual(Calc.evaluate('2+3'), 5));
test('subtraction', () => assert.strictEqual(Calc.evaluate('10-4'), 6));
test('multiplication', () => assert.strictEqual(Calc.evaluate('6*7'), 42));
test('division', () => assert.strictEqual(Calc.evaluate('20/4'), 5));
test('BODMAS order', () => assert.strictEqual(Calc.evaluate('2+3*4'), 14));
test('brackets', () => assert.strictEqual(Calc.evaluate('(2+3)*4'), 20));
test('power is right-associative', () => assert.strictEqual(Calc.evaluate('2^3^2'), 512));
test('negative numbers', () => assert.strictEqual(Calc.evaluate('-5+2'), -3));
test('decimal noise removed', () => assert.strictEqual(Calc.evaluate('0.1+0.2'), 0.3));
test('percent', () => assert.strictEqual(Calc.evaluate('50%'), 0.5));
test('factorial', () => assert.strictEqual(Calc.evaluate('5!'), 120));
test('sqrt', () => assert.strictEqual(Calc.evaluate('sqrt(144)'), 12));
test('sin(30) in degrees', () => assert.strictEqual(Calc.evaluate('sin(30)', 'deg'), 0.5));
test('cos(0) in radians', () => assert.strictEqual(Calc.evaluate('cos(0)', 'rad'), 1));
test('asin(1) in degrees', () => assert.strictEqual(Calc.evaluate('asin(1)', 'deg'), 90));
test('log(1000)', () => assert.strictEqual(Calc.evaluate('log(1000)'), 3));
test('ln(e)', () => assert.strictEqual(Calc.evaluate('ln(e)'), 1));
test('pi symbol', () => assert.strictEqual(Calc.evaluate('π'), Number(Math.PI.toPrecision(12))));
test('ans constant', () => assert.strictEqual(Calc.evaluate('ans*2', 'deg', 21), 42));
test('× ÷ symbols', () => assert.strictEqual(Calc.evaluate('8×3÷4'), 6));
test('divide by zero throws CalcError', () =>
  assert.throws(() => Calc.evaluate('5/0'), (e) => e instanceof Calc.CalcError));
test('sqrt of negative throws', () => assert.throws(() => Calc.evaluate('sqrt(-4)'), Calc.CalcError));
test('missing bracket throws', () => assert.throws(() => Calc.evaluate('(2+3'), Calc.CalcError));
test('empty expression throws', () => assert.throws(() => Calc.evaluate('   '), Calc.CalcError));

let failed = 0;
for (const t of tests) {
  try {
    t.fn();
    console.log('  PASS  ' + t.name);
  } catch (err) {
    failed++;
    console.log('  FAIL  ' + t.name + '\n        ' + err.message.split('\n')[0]);
  }
}
console.log(`\n${tests.length - failed}/${tests.length} tests passed`);
process.exit(failed ? 1 : 0);
