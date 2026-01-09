# Canonical Knowledge Graph Model

## Purpose

The canonical model defines a single, strict internal representation of
medical knowledge graphs, independent of how they were produced by LLMs.

All formats A–D MUST be normalized into this model before:

- visualization;
- comparison;
- validation;
- diff-graph construction.

---

## Core abstraction

The canonical model is a **directed bipartite graph**:

- Nodes are of two types:
  - Parameter nodes
  - Rule nodes
- Edges are strictly typed and directional:
  - Parameter → Rule (input dependency)
  - Rule → Parameter (output production)

No other node or edge types are allowed.

---

## Parameter node

### Definition

A parameter represents a medical variable or derived fact.

```json
{
  "id": "string",
  "type": "number | boolean | string",
  "description": "optional",
  "source": "input | derived"
}
```

---

### Semantics

- Parameters may represent:

  - raw measurements (e.g. systolic_pressure);
  - clinical states (e.g. hypertension_flag);
  - intermediate logical results.

- Parameters are immutable during rule execution.
- Each derived parameter SHOULD be produced by exactly one rule.

---

## Rule node

### Definition

A rule represents a deterministic transformation over parameters.

```json
{
  "id": "string",
  "inputs": ["parameter_id"],
  "outputs": ["parameter_id"],
  "logic": "JavaScript-like code"
}
```

---

### Semantics

- Rules:

  - read zero or more parameters;
  - write one or more parameters.

- Rules MUST NOT:

  - modify input parameters;
  - produce side effects;
  - depend on execution order.

- Rules are evaluated conceptually as pure functions.

---

## Edge definitions

### Input edge

```
(parameter) ──▶ (rule)
```

Meaning:

> Rule requires the parameter value to be evaluated.

---

### Output edge

```
(rule) ──▶ (parameter)
```

Meaning:

> Rule produces the parameter value.

---

## Graph-level constraints

### Structural constraints

- Graph MUST be bipartite.
- Parameter → Parameter edges are forbidden.
- Rule → Rule edges are forbidden.
- Cycles are forbidden.

---

### Logical constraints

- Every rule input MUST reference an existing parameter.
- Every rule output MUST reference an existing parameter.
- Output parameter types MUST match rule logic return type.

---

## Execution semantics (conceptual)

Although the system does NOT execute rules, the model assumes:

1. Input parameters are externally provided.
2. Rules can be topologically sorted.
3. Each rule computes its outputs exactly once.

This allows:

- static validation;
- dependency tracing;
- visualization of reasoning chains.

---

## Canonical JSON representation

```json
{
  "parameters": {
    "parameter_id": {
      "type": "number | boolean | string",
      "description": "optional",
      "source": "input | derived"
    }
  },
  "rules": {
    "rule_id": {
      "inputs": ["parameter_id"],
      "outputs": ["parameter_id"],
      "logic": "JavaScript-like code"
    }
  }
}
```

---

## Minimal example

```json
{
  "parameters": {
    "systolic_pressure": { "type": "number", "source": "input" },
    "diastolic_pressure": { "type": "number", "source": "input" },
    "hypertension": { "type": "boolean", "source": "derived" }
  },
  "rules": {
    "detect_hypertension": {
      "inputs": ["systolic_pressure", "diastolic_pressure"],
      "outputs": ["hypertension"],
      "logic": "hypertension = systolic_pressure >= 140 || diastolic_pressure >= 90;"
    }
  }
}
```

---

## Why this model is critical

This canonical representation guarantees:

- deterministic visualization;
- consistent diff computation;
- formal correctness constraints;
- independence from LLM output style.

All further transformations operate exclusively on this model.

---

## Next documents

- `04_normalization.md` — rules to convert formats A–D → canonical
- `05_graphviz_mapping.md` — canonical → Graphviz
- `06_diff_graph.md` — canonical graph comparison model

```

```
