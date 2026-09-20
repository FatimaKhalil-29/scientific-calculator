/* script.js - connects the buttons/keyboard to the logic in calc.js */
(function () {
  'use strict';

  const exprEl = document.getElementById('expr');
  const resultEl = document.getElementById('result');
  const modeBtn = document.getElementById('mode');
  const historyEl = document.getElementById('history');
  const clearHistoryBtn = document.getElementById('clear-history');

  let mode = 'deg';   // 'deg' or 'rad'
  let ans = 0;        // last successful answer
  let justEvaluated = false;
  const history = []; // newest first, max 8 items

  function insert(text) {
    // After "=", typing a number starts fresh; typing an operator continues from the answer
    if (justEvaluated) {
      if (/^[0-9.(πe]|^[a-z]/i.test(text) && !/^ans$/.test(text)) exprEl.value = '';
      else if (/^[+−×÷^%!]/.test(text)) exprEl.value = 'ans';
      justEvaluated = false;
    }
    const start = exprEl.selectionStart == null ? exprEl.value.length : exprEl.selectionStart;
    const end = exprEl.selectionEnd == null ? start : exprEl.selectionEnd;
    exprEl.value = exprEl.value.slice(0, start) + text + exprEl.value.slice(end);
    const pos = start + text.length;
    exprEl.setSelectionRange(pos, pos);
    exprEl.focus();
    showReady();
  }

  function showReady() {
    resultEl.classList.remove('error');
  }

  function backspace() {
    const start = exprEl.selectionStart;
    const end = exprEl.selectionEnd;
    if (start !== end) {
      exprEl.value = exprEl.value.slice(0, start) + exprEl.value.slice(end);
      exprEl.setSelectionRange(start, start);
    } else if (start > 0) {
      exprEl.value = exprEl.value.slice(0, start - 1) + exprEl.value.slice(start);
      exprEl.setSelectionRange(start - 1, start - 1);
    }
    justEvaluated = false;
    exprEl.focus();
  }

  function clearAll() {
    exprEl.value = '';
    resultEl.textContent = '0';
    showReady();
    justEvaluated = false;
    exprEl.focus();
  }

  function equals() {
    const expression = exprEl.value;
    try {
      const value = Calc.evaluate(expression, mode, ans);
      const shown = Calc.format(value);
      resultEl.textContent = shown;
      showReady();
      ans = value;
      justEvaluated = true;
      addHistory(expression, shown);
    } catch (err) {
      resultEl.classList.add('error');
      resultEl.textContent = err instanceof Calc.CalcError ? err.message : 'Something went wrong';
    }
  }

  function toggleMode() {
    mode = mode === 'deg' ? 'rad' : 'deg';
    modeBtn.textContent = mode.toUpperCase();
    modeBtn.setAttribute('aria-label',
      'Angle mode: ' + (mode === 'deg' ? 'degrees' : 'radians') + '. Press to switch.');
  }

  function addHistory(expression, shown) {
    history.unshift({ expression: expression, result: shown });
    if (history.length > 8) history.pop();
    renderHistory();
  }

  function renderHistory() {
    historyEl.innerHTML = '';
    if (history.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty';
      li.textContent = 'Your last calculations show up here.';
      historyEl.appendChild(li);
      return;
    }
    history.forEach(function (item) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = 'Use this expression again';
      const left = document.createElement('span');
      left.textContent = item.expression;
      const right = document.createElement('span');
      right.textContent = '= ' + item.result;
      btn.appendChild(left);
      btn.appendChild(right);
      btn.addEventListener('click', function () {
        exprEl.value = item.expression;
        resultEl.textContent = item.result;
        justEvaluated = false;
        exprEl.focus();
      });
      li.appendChild(btn);
      historyEl.appendChild(li);
    });
  }

  document.querySelectorAll('.pad button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const action = btn.dataset.action;
      if (action === 'equals') equals();
      else if (action === 'clear') clearAll();
      else if (action === 'back') backspace();
      else insert(btn.dataset.insert);
    });
  });

  modeBtn.addEventListener('click', toggleMode);
  clearHistoryBtn.addEventListener('click', function () {
    history.length = 0;
    renderHistory();
  });

  exprEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); equals(); }
    else if (e.key === 'Escape') clearAll();
  });
  exprEl.addEventListener('input', function () { justEvaluated = false; showReady(); });

  exprEl.focus();
})();
