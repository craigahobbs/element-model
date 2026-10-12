# CLAUDE.md

Notes for coding agents working in this repository.

## Overview

element-model is a small, dependency-free JavaScript (ESM) library that renders HTML/SVG element
hierarchies described as plain JavaScript objects. The entire implementation is one file,
`lib/elementModel.js`, with one test file, `test/testElementModel.js`.

## javascript-build

This is a [javascript-build](https://github.com/craigahobbs/javascript-build#readme) package. Read the javascript-build skill before running tests, lint, coverage, or changing the Makefile: [`../javascript-build/SKILL.md`](../javascript-build/SKILL.md) if that file exists, otherwise [https://raw.githubusercontent.com/craigahobbs/javascript-build/main/SKILL.md](https://raw.githubusercontent.com/craigahobbs/javascript-build/main/SKILL.md).

Local Makefile overrides:

- `USE_JSDOM` — jsdom is a development dependency (tests need a DOM)

## Architecture

An **element model** is recursively one of: `null`, an element object, or an array of element models.
`null` is always ignored. This single shape flows through every function.

An **element object** has exactly one *tag member* — `html`, `svg`, or `text` — which selects its kind.
`html` / `svg` tags must be non-empty strings. Optional members are `attr` (attributes object, or null),
`elem` (child element model), and `callback` (function or null, invoked with the created DOM node). Text
elements may not carry `attr` or `elem` (they may have `callback`). Unknown members are rejected.

The library exports three functions. Validation failures throw `ElementModelValidationError`, which is
**not** exported — tests match it with `{name: 'ElementModelValidationError'}`.

- `validateElements(elements)` — recursively validates the model and returns it unchanged (so it can
  wrap a value inline). Use it to assert that components produce valid output in tests. Validation is
  **structural only**: text values, attribute names, and attribute values are not checked, so it is not
  sanitization for untrusted input.
- `renderElements(parent, elements = null, clear = true)` — validates, then builds real DOM nodes under
  `parent` using `parent.ownerDocument` (`clear` calls `parent.replaceChildren()` first). It never
  imports a DOM, so it runs in the browser and under jsdom in tests alike. SVG nodes are created via
  `createElementNS`; null attribute values are skipped. Each callback fires right after its node is
  appended to *its own parent* — subtrees are built bottom-up, so a nested callback runs before the
  subtree is attached to the document. Use the node passed to the callback, not a document lookup.
- `renderElementsToString(elements = null, indent = null)` — pure server-side string renderer. It
  **ignores callbacks**, lowercases every tag name (SVG too — camelCase SVG tags like `linearGradient`
  do not survive; the DOM renderer keeps case), self-closes void HTML tags, HTML-escapes text and
  attribute values (not attribute names), sorts attributes alphabetically, prepends `<!DOCTYPE html>`
  when the output starts with `<html>`, and sets `xmlns` on each top-level `<svg>`. `indent` (number of
  spaces or a string, like `JSON.stringify`) pretty-prints and trims each text node.

Both renderers convert non-string text and attribute values with `String()`. The two renderers share the
model and validation rules but are otherwise independent; a change to the model's shape or validation
usually needs to be reflected in all three functions and their tests.

## Tests and docs

Tests create a DOM per test with `new JSDOM()` (from `jsdom/lib/api.js`). The JSDoc comments in
`lib/elementModel.js` plus `README.md` are the published API docs — update them with behavior changes.
