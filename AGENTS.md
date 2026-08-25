# AGENTS.md

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
Optional members are `attr` (attributes dict, or null), `elem` (child element model), and `callback`
(invoked with the created DOM node). Text elements may not carry `attr` or `elem`.

The library exposes three functions plus the `ElementModelValidationError` it throws:

- `validateElements(elements)` — recursively validates the model and returns it unchanged (so it can
  wrap a value inline). Throws `ElementModelValidationError` on any violation. Use it to verify
  untrusted models and to assert that components produce valid output in tests.
- `renderElements(parent, elements, clear=true)` — validates, then builds real DOM nodes under
  `parent` using `parent.ownerDocument`. It never imports a DOM, so it runs in the browser and under
  jsdom in tests alike. SVG nodes are created via `createElementNS`; null attribute values are skipped;
  callbacks fire after the node is appended.
- `renderElementsToString(elements, indent=null)` — pure server-side string renderer. It **ignores
  callbacks**, self-closes void HTML tags, HTML-escapes text and attribute values, sorts attributes
  alphabetically, prepends `<!DOCTYPE html>` when the root is `<html>`, and injects `xmlns` on a root
  `<svg>`. `indent` mirrors `JSON.stringify` (number of spaces or a string) for pretty-printing.

The two renderers share the model and validation rules but are otherwise independent; a change to the
model's shape or validation usually needs to be reflected in all three functions and their tests.
