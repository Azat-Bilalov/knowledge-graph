/**
 * Canonical Knowledge Graph Model
 *
 * This is the single, strict internal representation of medical knowledge graphs.
 * All input formats (A-D) are normalized into this model before any operations.
 */

/** Parameter types supported in the canonical model */
export type ParameterType = "number" | "boolean" | "string";

/** Source of a parameter - input (user provided) or derived (computed by rule) */
export type ParameterSource = "input" | "derived";

/**
 * A parameter represents a medical variable or derived fact.
 * Parameters are immutable during rule evaluation.
 */
export interface CanonicalParameter {
  id: string;
  type: ParameterType;
  description?: string;
  source: ParameterSource;
}

/**
 * A rule represents a deterministic transformation over parameters.
 * Rules are pure functions that read inputs and produce outputs.
 */
export interface CanonicalRule {
  id: string;
  inputs: string[];
  outputs: string[];
  logic: string;
}

/**
 * The canonical knowledge graph model.
 * This is a directed bipartite graph with Parameter and Rule nodes.
 * Edges are strictly typed:
 * - Parameter → Rule (input dependency)
 * - Rule → Parameter (output production)
 */
export interface CanonicalGraph {
  parameters: Record<string, CanonicalParameter>;
  rules: Record<string, CanonicalRule>;
}

/** Empty canonical graph for initialization */
export const EMPTY_CANONICAL_GRAPH: CanonicalGraph = {
  parameters: {},
  rules: {},
};

/**
 * Creates a new parameter with the given properties
 */
export function createParameter(
  id: string,
  type: ParameterType,
  source: ParameterSource,
  description?: string
): CanonicalParameter {
  return { id, type, source, description };
}

/**
 * Creates a new rule with the given properties
 */
export function createRule(
  id: string,
  inputs: string[],
  outputs: string[],
  logic: string
): CanonicalRule {
  return { id, inputs, outputs, logic };
}
