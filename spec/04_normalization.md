# Normalization to Canonical Model

## Purpose

Normalization defines deterministic procedures for converting
LLM-produced knowledge graphs (Formats A–D) into the Canonical Knowledge Graph Model.

The normalization process guarantees:

- structural validity;
- explicit dependencies;
- compatibility with visualization and diff algorithms.

---

## General normalization pipeline

All input formats follow the same high-level pipeline:

1. Parsing
2. Parameter registry construction
3. Rule extraction
4. Dependency resolution
5. Validation
6. Canonical model emission

Each step MUST either:

- succeed deterministically, or
- produce a structured error.

---

## Step 1 — Parsing

### Input

- Raw JSON text produced by an LLM
- Declared format type (A, B, C, or D)

### Output

- In-memory representation matching the declared format schema

### Errors

- Invalid JSON
- Schema mismatch
- Unknown format type

---

## Step 2 — Parameter registry construction

### Goal

Build a unified registry of all parameters referenced in the input.

### Rules

- Each parameter MUST have:
  - unique identifier;
  - declared type (`number | boolean | string`);
- Parameter identifiers MUST be normalized:
  - trimmed;
  - lower_snake_case;
  - ASCII only.

### Errors

- Missing type declaration
- Conflicting type declarations
- Empty parameter name

---

## Step 3 — Rule extraction

### Format-specific behavior

#### Format A

- Rules are taken directly.
- Inputs and outputs are already explicit.

#### Format B

- Each pipeline step becomes a rule.
- Inputs and outputs are inferred by static analysis of logic:
  - left-hand side → outputs;
  - referenced variables → inputs.

#### Format C

- Each atomic block becomes a rule.
- Input and output parameters are taken directly from block definition.

#### Format D

- Each `computed_by` entry becomes a rule.
- The parameter itself becomes the output.
- Inputs are taken from the computation entry.

---

## Step 4 — Dependency resolution

### Goal

Make all parameter dependencies explicit.

### Procedure

For each rule:

1. Verify that all input parameters exist.
2. Verify that all output parameters exist.
3. Create:
   - Parameter → Rule edges (inputs)
   - Rule → Parameter edges (outputs)

### Errors

- Undeclared parameter reference
- Rule with zero outputs
- Output parameter written by multiple rules

---

## Step 5 — Validation

### Structural validation

- Graph MUST be bipartite.
- No parameter-to-parameter edges.
- No rule-to-rule edges.

### Logical validation

- Parameter types are respected.
- Rule logic assigns values to all outputs.
- Cycles are not allowed.

Cycle detection is performed via:

- topological sorting attempt;
- failure indicates a cycle.

---

## Step 6 — Canonical model emission

### Output format

```json
{
  "parameters": { ... },
  "rules": { ... }
}
```

### Guarantees

- All parameters are declared exactly once.
- All rules have explicit inputs and outputs.
- The graph is acyclic and bipartite.

---

## Error model

Normalization errors MUST be structured:

```json
{
  "error_type": "string",
  "message": "human-readable description",
  "location": {
    "format": "A | B | C | D",
    "rule_id": "optional",
    "parameter": "optional"
  }
}
```

Errors are displayed:

- under the code editor;
- in the visualization tab.

---

## Non-goals of normalization

Normalization does NOT:

- resolve semantic synonymy;
- perform ontology alignment;
- execute rule logic;
- infer missing medical knowledge.

These concerns are explicitly deferred.

---

## Determinism guarantee

Given identical input text and format type,
normalization MUST produce identical canonical graphs.

This property is critical for:

- diff computation;
- reproducibility;
- scientific evaluation.

---

## Next documents

- `05_graphviz_mapping.md` — canonical → Graphviz visualization
- `06_diff_graph.md` — multi-LLM graph comparison
