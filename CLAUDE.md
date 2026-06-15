# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

element-model is a small, dependency-free JavaScript (ESM) library that renders HTML/SVG element
hierarchies described as plain JavaScript objects. The entire implementation is one file,
`lib/elementModel.js`, with one test file, `test/testElementModel.js`.

## Commands

The project builds with [javascript-build](https://github.com/craigahobbs/javascript-build) via a
`Makefile` that downloads `Makefile.base`, `eslint.config.js`, and `jsdoc.json` on first run (copying
from a sibling `../javascript-build` checkout if present, otherwise fetching from the web).

- `make commit` — the full gate: runs `test`, `lint`, `doc`, and `cover`. Run this before considering work done.
- `make test` — run unit tests (`node --test`).
- `make test TEST='pattern'` — run only tests whose name matches `pattern` (passed to `--test-name-pattern`).
- `make lint` — ESLint.
- `make doc` — generate JSDoc into `build/doc/`.
- `make cover` — run tests under c8 with **100% coverage required** (`--100 --all`); HTML report in `build/coverage/`.
- `make clean` / `make superclean` — remove build artifacts (and downloaded build files / caches).
- `npm test` also works for a quick test run without the Makefile.

By default commands run against the **host's** Node/npm. Set `USE_DOCKER=1` or `USE_PODMAN=1` to run
inside the pinned container image instead (e.g. `make test USE_DOCKER=1`).

Because `make cover` enforces 100% line/branch coverage, any new code path must come with a covering
test or CI (`make commit`) will fail.

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
