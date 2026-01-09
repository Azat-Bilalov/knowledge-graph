# Implementation Guidelines (MVP)

## Purpose

This document defines:

- the technical stack;
- architectural constraints;
- coding conventions;
- MVP completeness criteria.

It exists to ensure that the AI-agent produces:

- a runnable application;
- with predictable structure;
- aligned with the research and educational goals.

---

## Technology stack

### Core

- Frontend framework: **React 18+**
- Language: **TypeScript**
- Build tool: **Vite**

No backend is used in MVP.

---

### UI framework

Preferred UI framework:

- **Hero UI**

Alternatives (allowed but discouraged unless necessary):

- Radix UI
- Mantine

UI framework MUST support:

- tabs;
- modals;
- buttons;
- dropdowns.

---

### Code editor

- **Monaco Editor**

Requirements:

- JSON syntax highlighting;
- error markers;
- programmatic access to content.

---

### Graph rendering

#### MVP renderer

- **Graphviz (via WASM or viz.js)**

#### Abstraction requirement

Graph rendering MUST be isolated behind an interface:

```ts
interface GraphRenderer {
  render(graph: VisualGraph): RenderResult;
}
```

This allows future replacement without refactoring core logic.

---

## Application architecture

### Architectural style

- Feature-Sliced Design (FSD) **lightweight profile**
- No over-engineering
- No global state libraries unless necessary

---

### Suggested folder structure

```
src/
├── app/
│   └── App.tsx
├── features/
│   ├── editor/
│   ├── visualization/
│   ├── diff/
│   └── help/
├── entities/
│   ├── parameter/
│   ├── rule/
│   └── graph/
├── shared/
│   ├── ui/
│   ├── lib/
│   └── types/
└── spec/
    └── formats/
```

---

## Core modules

### Normalization module

Responsibilities:

- parse formats A–D;
- validate structure;
- emit canonical model;
- emit structured errors.

MUST be:

- pure;
- deterministic;
- UI-agnostic.

---

### Visualization module

Responsibilities:

- map canonical model → visual graph;
- map visual graph → Graphviz DOT.

MUST NOT:

- access editor state directly;
- perform normalization.

---

### Diff module

Responsibilities:

- accept multiple canonical graphs;
- compute unified diff graph;
- compute agreement metrics.

MUST NOT:

- modify original graphs.

---

## Error handling rules

- All errors are values, not thrown exceptions.
- Errors propagate upward with context.
- UI decides how to render errors.

---

## Coding conventions

- Explicit types everywhere
- No `any`
- No implicit type coercion
- No dynamic evaluation of rule logic

Rule logic is treated as opaque text.

---

## Performance constraints (MVP)

- Expected graph size:

  - up to ~200 parameters;
  - up to ~100 rules.

- Rendering should complete within:

  - < 1 second per graph on modern hardware.

---

## Testing requirements (minimal)

At least:

- unit tests for normalization logic;
- unit tests for diff logic.

UI testing is optional in MVP.

---

## Definition of “Done” (MVP)

The MVP is considered complete when:

- [ ] User can add ≥2 editor tabs
- [ ] User can select formats A–D
- [ ] Graphs render per tab
- [ ] Diff graph renders correctly
- [ ] Errors are displayed per tab
- [ ] Help modal explains formats + prompts
- [ ] No backend is required
- [ ] Application builds and runs locally

---

## Explicit non-goals

The MVP does NOT include:

- authentication;
- persistence;
- collaborative editing;
- semantic normalization;
- medical validation.

---

## Final note

This implementation is intentionally constrained to:

- support experimentation;
- enable reproducibility;
- serve as a teaching and research tool.

Extensions are expected, but not required for MVP.
