# Canonical Model → Graph Visualization Mapping

## Purpose

This document defines how the Canonical Knowledge Graph Model
is transformed into a visual graph representation.

The mapping is:

- deterministic;
- engine-agnostic at the conceptual level;
- implemented via Graphviz in the MVP.

---

## Visualization abstraction layer

The system MUST separate:

1. **Graph semantic model**
2. **Visual node/edge descriptors**
3. **Rendering backend**

Graphviz is treated as a backend, not as a core dependency.

---

## Visual entities

### Node types

There are exactly two visual node types:

| Canonical entity | Visual node   |
| ---------------- | ------------- |
| Parameter        | ParameterNode |
| Rule             | RuleNode      |

---

### Edge types

| Canonical edge   | Visual edge |
| ---------------- | ----------- |
| Parameter → Rule | InputEdge   |
| Rule → Parameter | OutputEdge  |

---

## Node visual specification

### Parameter node

```json
{
  "id": "parameter_id",
  "label": "parameter_id",
  "shape": "ellipse",
  "style": "solid",
  "color": "black",
  "metadata": {
    "type": "number | boolean | string",
    "source": "input | derived"
  }
}
```

#### Visual rules

- Input parameters:

  - solid border

- Derived parameters:

  - dashed border

- Type MAY be shown as a tooltip or secondary label.

---

### Rule node

```json
{
  "id": "rule_id",
  "label": "rule_id",
  "shape": "box",
  "style": "rounded",
  "color": "black",
  "metadata": {
    "inputs": ["parameter_id"],
    "outputs": ["parameter_id"]
  }
}
```

#### Visual rules

- Rules are visually distinct from parameters.
- Logic code is NOT shown by default.
- Logic MAY be available via hover or side panel in future versions.

---

## Edge visual specification

### Input edge (Parameter → Rule)

```json
{
  "from": "parameter_id",
  "to": "rule_id",
  "style": "solid",
  "arrowhead": "normal"
}
```

---

### Output edge (Rule → Parameter)

```json
{
  "from": "rule_id",
  "to": "parameter_id",
  "style": "solid",
  "arrowhead": "normal"
}
```

---

## Graphviz DOT mapping

### Graph structure

```dot
digraph KnowledgeGraph {
  rankdir=LR;
  node [fontname="Inter"];
}
```

---

### Parameter nodes

```dot
parameter_id [
  shape=ellipse,
  label="parameter_id",
  style=dashed
];
```

---

### Rule nodes

```dot
rule_id [
  shape=box,
  style="rounded,filled",
  fillcolor=lightgray,
  label="rule_id"
];
```

---

### Edges

```dot
parameter_id -> rule_id;
rule_id -> parameter_id;
```

---

## Layout constraints

- Graph direction: Left → Right
- Parameters SHOULD appear left of rules they feed into.
- Derived parameters SHOULD appear right of producing rules.

Graphviz `rank` MAY be used to improve readability but MUST NOT encode semantics.

---

## Error visualization

If canonical graph generation fails:

- Visualization tab MUST display:

  - error message;
  - affected rule or parameter id.

- No partial graph is rendered.

---

## Engine-agnostic guarantee

The visualization layer MUST expose an intermediate representation:

```json
{
  "nodes": [...],
  "edges": [...]
}
```

Graphviz mapping is a pure transformation:

```
visual graph → DOT string
```

This allows future replacement with:

- Cytoscape.js
- D3.js
- Elk.js

without touching normalization or diff logic.

---

## Non-goals

Visualization does NOT:

- imply rule execution order;
- validate medical correctness;
- resolve semantic equivalence.

---

## Next document

- `06_diff_graph.md` — visual and structural comparison of multiple canonical graphs
