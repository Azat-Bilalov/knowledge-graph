# UI Behavior Specification

## Purpose

This document defines the behavior of the web application UI,
including layout, interactions, error handling, and user flows.

The UI is designed for:

- comparing knowledge graphs produced by multiple LLMs;
- inspecting errors and inconsistencies;
- educational and experimental usage.

---

## High-level layout

The application UI is split vertically into two main areas:

```

+-----------------------+------------------------+
| Code Editors | Graph Visualization |
| (left panel) | (right panel) |
+-----------------------+------------------------+

```

---

## Left panel — Code Editors

### Tabs

- Each tab corresponds to one LLM output.
- Tabs are labeled:
  - `LLM 1`, `LLM 2`, `LLM 3`, …
- Tabs can be:
  - added;
  - removed;
  - reordered.

Each tab contains an independent code editor instance.

---

### Code editor

Editor requirements:

- JSON syntax highlighting
- Line numbers
- Error underline / highlight
- Read-only mode is NOT supported (always editable)

Recommended implementation:

- Monaco Editor or equivalent

---

### Format selector

Above the editor area:

- A dropdown selector with options:
  - Format A
  - Format B
  - Format C
  - Format D

Behavior:

- The selected format applies to ALL editor tabs.
- Changing format does NOT modify editor content.
- Format selection affects normalization logic only.

---

### Error output (code-level)

Below each editor tab:

- An error panel shows:
  - parsing errors;
  - normalization errors;
  - validation errors.

If no errors exist, the panel is hidden.

Errors are displayed in structured form:

- error type;
- message;
- optional rule / parameter reference.

---

## Right panel — Graph Visualization

### Visualization tabs

- Each code editor tab has a corresponding visualization tab.
- One additional tab exists:
  - `Diff Graph`

Total visualization tabs = editor tabs + 1.

---

### Render button

A single global button:

> **Render graphs**

Behavior:

- Triggers normalization for ALL editor tabs.
- For each tab:
  - if normalization succeeds → render graph;
  - if normalization fails → show error placeholder.
- If at least two graphs are valid → render diff graph.

---

### Visualization behavior per tab

For each visualization tab:

- If graph is valid:
  - display rendered graph;
- If graph fails:
  - display error message instead of graph.

Graphs are NOT auto-rendered on every keystroke (MVP constraint).

---

### Error output (visual-level)

Visualization errors are shown:

- inside the visualization tab;
- mirrored in the corresponding editor error panel.

---

## Diff graph tab

### Availability

- Visible only if at least two valid canonical graphs exist.
- Otherwise:
  - tab is disabled or hidden.

---

### Content

Diff tab displays:

- combined diff graph visualization;
- agreement metrics (parameters, rules).

---

## Help system ("?")

### Access

- A persistent “?” button in the application header.

---

### Help modal content

The modal contains:

1. Description of the application purpose
2. Explanation of Formats A–D
3. For each format:
   - short description;
   - minimal JSON example;
   - example LLM prompt to generate rules in that format
4. Description of:
   - canonical model;
   - diff graph color coding.

Content is static and versioned with the app.

---

## Global error handling

### Fatal errors

If a fatal error occurs (e.g. internal exception):

- UI shows a global error banner;
- user input is preserved;
- reload is suggested.

---

### Partial failure tolerance

The system MUST support:

- some graphs valid;
- some graphs invalid.

Failures in one tab MUST NOT block others.

---

## State persistence (MVP)

- Application state is stored in memory only.
- No backend, no authentication.
- Refresh clears all data.

Persistence MAY be added later via:

- localStorage;
- URL state encoding.

---

## Non-goals (explicit)

The UI does NOT:

- auto-correct LLM outputs;
- suggest fixes;
- perform semantic alignment;
- execute rule logic.

---

## Accessibility (minimal)

- Keyboard navigation between tabs
- Readable color contrast
- No strict WCAG compliance in MVP

---

## Next document

- `08_implementation_guidelines.md` — tech stack, libraries, coding rules
