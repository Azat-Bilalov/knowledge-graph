# Architecture

## High-level architecture

The application follows a layered architecture with strict separation of concerns.

```
User Input (JSON/Text)
↓
Format-specific Parser (A | B | C | D)
↓
Canonical Graph Model
↓
Graph Operations

validation

diff
↓
Renderer Adapter

Graphviz (current)

other renderers (future)
↓
UI Visualization
```

---

## Architectural invariants

The following rules MUST be preserved:

1. The UI layer MUST NOT depend on input formats A–D.
2. The UI layer MUST operate only on:
   - raw input text
   - validation results
   - rendered visual output
3. All input formats MUST be normalized into a single canonical graph model.
4. Graph comparison (diff) MUST operate on canonical graphs only.
5. Visualization MUST be implemented via a renderer adapter interface.

---

## Layer responsibilities

### 1. Input layer

- Holds raw user-provided text (JSON or DSL)
- Associates each input with:
  - an LLM label
  - a declared input format (A–D)

### 2. Parsing & normalization layer

- Validates syntactic correctness
- Converts format-specific structures into canonical graph structures
- Produces structured errors when conversion fails

### 3. Canonical graph layer

- Represents the knowledge graph using strict typing and constraints
- Acts as the single source of truth for all downstream operations

### 4. Graph operations layer

- Validates semantic correctness
- Generates diff-graphs
- Prepares data for visualization

### 5. Rendering layer

- Converts canonical or diff graphs into a visual representation
- Current implementation: Graphviz DOT → SVG
- Must be replaceable without affecting other layers

### 6. UI layer

- Displays editors, visualizations, and errors
- Provides user interaction (tabs, buttons, help modal)
- Does not contain domain logic
