# Input Formats

The system supports multiple input formats (A–D) for LLM-generated knowledge.
These formats are intentionally different to explore trade-offs between:

- LLM-friendliness
- structural explicitness
- ease of normalization

All formats MUST be normalized into the same canonical graph model.

---

## Common domain assumptions

Across all formats:

- Knowledge is represented as a directed graph.
- Nodes are of two conceptual kinds:
  - parameters
  - rules
- Edges follow the pattern:
  parameter → rule → parameter
- Parameters are strictly typed:
  - number
  - boolean
  - string

---

## Format A — Rule-as-Function Graph

### Description

Format A represents knowledge as a set of typed parameters and a set of rules.
Each rule explicitly declares:

- input parameters
- output parameters
- executable logic (JavaScript-like)

This format balances expressiveness and structure.

### Intended usage

- Primary internal representation after normalization
- Suitable for complex logical chains

### Guarantees

- Explicit dependencies
- Explicit parameter typing
- Deterministic graph reconstruction

---

## Format A — Rule-as-Function Graph (complete specification)

### Description

Format A represents medical knowledge as:

- a global registry of typed parameters;
- a list of rules operating on these parameters.

Each rule explicitly defines:

- which parameters it reads (inputs);
- which parameters it writes (outputs);
- the logic used to compute outputs.

This format is the most expressive and is close to the canonical internal model.

---

### Structure

```json
{
  "parameters": {
    "parameter_name": {
      "type": "number | boolean | string",
      "description": "optional human-readable description"
    }
  },
  "rules": [
    {
      "id": "string",
      "inputs": ["parameter_name"],
      "outputs": ["parameter_name"],
      "logic": "JavaScript-like assignment statements"
    }
  ]
}
```

---

### Constraints

- All parameters used in rules MUST be declared in `parameters`.
- Rules MUST NOT modify input parameters.
- Each output parameter SHOULD be written by only one rule.
- Logic MUST be side-effect free.
- Only simple expressions are allowed:

  - boolean logic
  - numeric comparisons
  - assignments

---

### Intended role in the system

- Preferred internal format after normalization
- Reference format for Graphviz generation
- Reference format for diff-graph computation

---

## Format B — Linear Rule Pipeline

### Description

Format B represents knowledge as a sequential pipeline of rules.
The order of rules defines the execution order and dependency resolution.

This format is optimized for:

- long logical chains;
- limited LLM context windows.

---

### Structure

```json
{
  "parameters": {
    "parameter_name": {
      "type": "number | boolean | string"
    }
  },
  "pipeline": [
    {
      "rule_id": "string",
      "logic": "JavaScript-like assignment statements"
    }
  ]
}
```

---

### Constraints

- Rules are executed top-to-bottom.
- Logic may only read previously defined or input parameters.
- Output parameters MUST be assigned explicitly.
- Implicit dependencies are allowed but MUST be recoverable by static analysis.

---

### Intended role in the system

- LLM-friendly generation of long rule chains
- Educational illustration of procedural reasoning
- Normalized into Format A before further processing

---

## Format C — Atomic Rule Blocks

### Description

Format C represents knowledge as a collection of independent, atomic rules.
Each rule is self-contained and declares its own inputs and outputs.

This format minimizes context requirements for LLMs.

---

### Structure

```json
[
  {
    "rule_id": "string",
    "input_parameters": [
      { "name": "string", "type": "number | boolean | string" }
    ],
    "output_parameters": [
      { "name": "string", "type": "number | boolean | string" }
    ],
    "logic": "JavaScript-like assignment or return expression"
  }
]
```

---

### Constraints

- Each rule MUST be self-contained.
- Input and output parameter types MUST be explicitly declared.
- Output parameters SHOULD NOT be written by multiple rules.
- Rules MUST NOT rely on execution order.

---

### Intended role in the system

- Primary format for LLM generation experiments
- Best format for chunked or incremental LLM outputs
- Normalized into Format A via aggregation

---

## Format D — Parameter-centric Rules

### Description

Format D organizes knowledge around parameters rather than rules.
Each parameter explicitly declares how it is computed.

---

### Structure

```json
{
  "parameter_name": {
    "type": "number | boolean | string",
    "computed_by": [
      {
        "inputs": ["parameter_name"],
        "logic": "JavaScript-like expression returning a value"
      }
    ]
  }
}
```

---

### Constraints

- Each computed parameter MUST have at least one computation rule.
- Cyclic dependencies are not allowed.
- Logic MUST return a value of the declared parameter type.

---

### Intended role in the system

- Exploring alternative knowledge organization strategies
- Preventing conflicting writes to parameters
- Normalized into Format A by rule extraction

---

## Summary of formats

| Format | LLM-friendly | Expressiveness | Determinism | Primary Use         |
| ------ | ------------ | -------------- | ----------- | ------------------- |
| A      | Medium       | High           | High        | Canonical reference |
| B      | High         | Medium         | Medium      | Long chains         |
| C      | Very High    | Medium         | High        | LLM extraction      |
| D      | Medium       | Medium         | High        | Parameter safety    |

---

## Normalization guarantee

All formats A–D MUST be convertible into:

- a unified set of parameters;
- a unified set of rules with explicit inputs and outputs.

The result of normalization is defined in `03_canonical_model.md`.
