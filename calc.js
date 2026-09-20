/* calc.js - calculator logic (no DOM here, so it can be tested with Node) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Calc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Custom exception (same idea as CalcException in the Java version)
  class CalcError extends Error {
    constructor(message) {
      super(message);
      this.name = 'CalcError';
    }
  }

  function factorial(n) {
    if (!Number.isInteger(n) || n < 0) throw new CalcError('Factorial needs a whole number (0 or more)');
    if (n > 170) throw new CalcError('Result is too large');
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  function tokenize(src) {
    const s = src
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'pi')
      .replace(/\s+/g, '');
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/[0-9.]/.test(c)) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const text = s.slice(i, j);
        if (text === '.' || (text.match(/\./g) || []).length > 1) throw new CalcError('Invalid number');
        tokens.push({ type: 'num', value: parseFloat(text) });
        i = j;
      } else if (/[a-z]/i.test(c)) {
        let j = i;
        while (j < s.length && /[a-z]/i.test(s[j])) j++;
        tokens.push({ type: 'id', value: s.slice(i, j).toLowerCase() });
        i = j;
      } else if ('+-*/^!%()'.includes(c)) {
        tokens.push({ type: 'op', value: c });
        i++;
      } else {
        throw new CalcError('Unknown character: ' + c);
      }
    }
    return tokens;
  }

  function evaluate(expression, mode, ans) {
    mode = mode || 'deg';
    ans = ans || 0;
    if (!expression || !expression.trim()) throw new CalcError('Type an expression first');

    const tokens = tokenize(expression);
    let pos = 0;

    const toRad = (x) => (mode === 'deg' ? (x * Math.PI) / 180 : x);
    const fromRad = (x) => (mode === 'deg' ? (x * 180) / Math.PI : x);

    const functions = {
      sin: (x) => Math.sin(toRad(x)),
      cos: (x) => Math.cos(toRad(x)),
      tan: (x) => {
        if (mode === 'deg' && Math.abs(x % 180) === 90) throw new CalcError('tan is undefined here');
        return Math.tan(toRad(x));
      },
      asin: (x) => {
        if (x < -1 || x > 1) throw new CalcError('asin needs a value between -1 and 1');
        return fromRad(Math.asin(x));
      },
      acos: (x) => {
        if (x < -1 || x > 1) throw new CalcError('acos needs a value between -1 and 1');
        return fromRad(Math.acos(x));
      },
      atan: (x) => fromRad(Math.atan(x)),
      log: (x) => {
        if (x <= 0) throw new CalcError('log needs a positive number');
        return Math.log10(x);
      },
      ln: (x) => {
        if (x <= 0) throw new CalcError('ln needs a positive number');
        return Math.log(x);
      },
      sqrt: (x) => {
        if (x < 0) throw new CalcError('Cannot take the square root of a negative number');
        return Math.sqrt(x);
      },
      abs: (x) => Math.abs(x),
    };
    const constants = { pi: Math.PI, e: Math.E, ans: ans };

    const peek = () => tokens[pos];
    const isOp = (v) => peek() && peek().type === 'op' && peek().value === v;

    function parseExpr() {
      let left = parseTerm();
      while (isOp('+') || isOp('-')) {
        const op = tokens[pos++].value;
        const right = parseTerm();
        left = op === '+' ? left - right : left - right;
      }
      return left;
    }

    function parseTerm() {
      let left = parseUnary();
      while (isOp('*') || isOp('/')) {
        const op = tokens[pos++].value;
        const right = parseUnary();
        if (op === '*') left = left * right;
        else {
          if (right === 0) throw new CalcError('Cannot divide by zero');
          left = left / right;
        }
      }
      return left;
    }

    function parseUnary() {
      if (isOp('-')) { pos++; return -parseUnary(); }
      if (isOp('+')) { pos++; return parseUnary(); }
      return parsePower();
    }

    function parsePower() {
      const base = parsePostfix();
      if (isOp('^')) {
        pos++;
        return Math.pow(base, parseUnary()); // right-associative
      }
      return base;
    }

    function parsePostfix() {
      let value = parsePrimary();
      while (isOp('!') || isOp('%')) {
        const op = tokens[pos++].value;
        value = op === '!' ? factorial(value) : value / 100;
      }
      return value;
    }

    function parsePrimary() {
      const t = peek();
      if (!t) throw new CalcError('Expression is incomplete');
      if (t.type === 'num') { pos++; return t.value; }
      if (t.type === 'id') {
        pos++;
        if (t.value in constants) return constants[t.value];
        if (t.value in functions) {
          if (!isOp('(')) throw new CalcError(t.value + ' needs brackets, e.g. ' + t.value + '(30)');
          pos++;
          const arg = parseExpr();
          if (!isOp(')')) throw new CalcError('Missing closing bracket');
          pos++;
          return functions[t.value](arg);
        }
        throw new CalcError('Unknown name: ' + t.value);
      }
      if (isOp('(')) {
        pos++;
        const inner = parseExpr();
        if (!isOp(')')) throw new CalcError('Missing closing bracket');
        pos++;
        return inner;
      }
      throw new CalcError('Unexpected ' + t.value);
    }

    const result = parseExpr();
    if (pos < tokens.length) throw new CalcError('Unexpected ' + tokens[pos].value);
    if (!Number.isFinite(result)) throw new CalcError('Result is not a finite number');
    return Number(result.toPrecision(12)); // hides 0.1 + 0.2 style float noise
  }

  function format(n) {
    const abs = Math.abs(n);
    if (n !== 0 && (abs >= 1e12 || abs < 1e-9)) return n.toExponential(6).replace(/\.?0+e/, 'e');
    return String(n);
  }

  return { evaluate, format, factorial, CalcError };
});
