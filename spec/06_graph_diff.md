# Diff Graph Specification

## Purpose

The diff graph represents structural and logical differences
between multiple canonical knowledge graphs derived from different LLMs.

It is used to:

- visually compare reasoning structures;
- detect missing or conflicting knowledge;
- support experimental evaluation of LLM agreement.

---

## Scope

The diff graph compares:

- parameters;
- rules;
- dependencies (edges).

It does NOT compare:

- rule logic semantics beyond textual equality;
- medical correctness.

---

## Comparison model

Let:

- G₁, G₂, …, Gₙ be canonical graphs from different LLMs.
- Each graph consists of:
  - parameter set P
  - rule set R
  - dependency edges E

---

## Diff graph entities

### Unified node set

The diff graph contains the union:

- Parameters: `P = ⋃ Pᵢ`
- Rules: `R = ⋃ Rᵢ`

Each node is annotated with **presence vector**.

---

### Presence vector

```json
{
  "present_in": ["llm_1", "llm_2"]
}
```

---

## Node status classification

### Parameters

| Status  | Condition                    |
| ------- | ---------------------------- |
| common  | present in all graphs        |
| partial | present in some graphs       |
| unique  | present in exactly one graph |

---

### Rules

Rules are considered identical if:

- rule_id is identical;
- input set is identical;
- output set is identical;
- logic string is identical (exact match).

Otherwise, they are treated as distinct rules.

---

## Edge comparison

Edges are compared as ordered pairs:

```
(source_id, target_id)
```

Edge status mirrors node presence classification.

---

## Color coding (Graphviz)

### Nodes

| Status  | Color  |
| ------- | ------ |
| common  | black  |
| partial | orange |
| unique  | red    |

---

### Edges

| Status  | Style  |
| ------- | ------ |
| common  | solid  |
| partial | dashed |
| unique  | bold   |

---

## Diff graph visual semantics

- All nodes and edges are shown in a single graph.
- Colors encode agreement level.
- No node duplication is allowed.

---

## Graphviz DOT extensions

### Node styling example

```dot
hypertension [
  shape=ellipse,
  color=orange,
  label="hypertension\n(2/3)"
];
```

---

### Edge styling example

```dot
rule1 -> hypertension [
  style=dashed,
  color=orange
];
```

---

## Quantitative agreement metrics

Diff computation MUST also produce metrics:

```json
{
  "parameters": {
    "total": 12,
    "common": 7,
    "partial": 3,
    "unique": 2
  },
  "rules": {
    "total": 9,
    "common": 4,
    "partial": 3,
    "unique": 2
  }
}
```

These metrics are displayed alongside the graph.

---

## Algorithm (high-level)

1. Normalize all inputs → canonical graphs
2. Build unified node and edge sets
3. Compute presence vectors
4. Assign visual attributes
5. Emit:

   - visual graph
   - agreement metrics

---

## Determinism guarantee

Given identical canonical graphs and identical LLM labels,
the diff graph MUST be identical.

---

## Non-goals

Diff graph does NOT:

- resolve naming inconsistencies;
- merge semantically equivalent rules;
- evaluate correctness.

These are deferred to future research.

---

## Next document

- `07_ui_behavior.md` — UI logic, tabs, errors, interactions
