# Pink Scientific Calculator

A small scientific calculator built with plain HTML, CSS and JavaScript.
Made for **Software Engineering – Assignment 01** (Build and Deploy a Small Application with a GitHub DevOps workflow).

## Features
- Basic operations: `+  −  ×  ÷  %`, brackets, decimals
- Scientific functions: `sin cos tan`, inverse trig, `ln`, `log`, `√`, `xʸ`, `n!`, `π`, `e`
- Degree / Radian switch
- `Ans` key (uses the previous answer)
- Calculation history (click an item to reuse it)
- Clear error messages (divide by zero, invalid brackets, etc.)
- Works with both buttons and keyboard (Enter = equals, Esc = clear)

## Run locally
Open `index.html` in any browser. No install needed.

## Tests and CI
```
npm run build   # checks files are present/linked and JS has no syntax errors
npm test        # runs the calculator logic tests
```
The same two commands run automatically on every push to `main` through
GitHub Actions (`.github/workflows/ci.yml`).

## Project structure
| File | Purpose |
|------|---------|
| `index.html`, `style.css` | Page layout and design |
| `calc.js` | Calculator logic (parser, functions, `CalcError`) |
| `script.js` | Connects buttons and keyboard to the logic |
| `test.js`, `check.js` | Tests and build check used by CI |
| `.github/workflows/ci.yml` | GitHub Actions workflow |
