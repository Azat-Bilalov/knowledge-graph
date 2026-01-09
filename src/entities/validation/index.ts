/**
 * Canonical Graph Validation
 * 
 * Validates structural and logical constraints on canonical graphs:
 * - Bipartite structure (Parameter ↔ Rule only)
 * - No cycles
 * - All references valid
 */

import type { CanonicalGraph } from '../../shared/types/canonical';
import type { Result, NormalizationError } from '../../shared/types/errors';
import { ok, err, Errors } from '../../shared/types/errors';

/**
 * Performs topological sort to detect cycles
 * Returns sorted node IDs or null if cycle exists
 */
function topologicalSort(
  graph: CanonicalGraph
): { sorted: string[]; hasCycle: boolean; cyclePath?: string[] } {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const sorted: string[] = [];
  let cyclePath: string[] | undefined;

  // Build adjacency list from rules
  const adjacency = new Map<string, string[]>();
  
  // Initialize all parameters and rules as nodes
  for (const paramId of Object.keys(graph.parameters)) {
    adjacency.set(`param:${paramId}`, []);
  }
  for (const ruleId of Object.keys(graph.rules)) {
    adjacency.set(`rule:${ruleId}`, []);
  }

  // Add edges: param -> rule (input) and rule -> param (output)
  for (const rule of Object.values(graph.rules)) {
    // Input edges: param points to rule
    for (const inputId of rule.inputs) {
      const edges = adjacency.get(`param:${inputId}`) || [];
      edges.push(`rule:${rule.id}`);
      adjacency.set(`param:${inputId}`, edges);
    }
    // Output edges: rule points to param
    for (const outputId of rule.outputs) {
      const edges = adjacency.get(`rule:${rule.id}`) || [];
      edges.push(`param:${outputId}`);
      adjacency.set(`rule:${rule.id}`, edges);
    }
  }

  function dfs(nodeId: string, path: string[]): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, [...path, neighbor])) {
          return true; // Cycle found
        }
      } else if (recursionStack.has(neighbor)) {
        // Found a back edge - cycle detected
        cyclePath = [...path, neighbor];
        return true;
      }
    }

    recursionStack.delete(nodeId);
    sorted.push(nodeId);
    return false;
  }

  // Run DFS from all unvisited nodes
  for (const nodeId of adjacency.keys()) {
    if (!visited.has(nodeId)) {
      if (dfs(nodeId, [nodeId])) {
        return { sorted: [], hasCycle: true, cyclePath };
      }
    }
  }

  return { sorted: sorted.reverse(), hasCycle: false };
}

/**
 * Validates that the graph is properly bipartite
 */
function validateBipartite(graph: CanonicalGraph): NormalizationError[] {
  const errors: NormalizationError[] = [];

  // Check that rules only connect to parameters, not other rules
  for (const rule of Object.values(graph.rules)) {
    for (const inputId of rule.inputs) {
      if (graph.rules[inputId]) {
        errors.push(Errors.bipartiteViolation(
          `Rule "${rule.id}" has input "${inputId}" which is a rule, not a parameter`
        ));
      }
    }
    for (const outputId of rule.outputs) {
      if (graph.rules[outputId]) {
        errors.push(Errors.bipartiteViolation(
          `Rule "${rule.id}" has output "${outputId}" which is a rule, not a parameter`
        ));
      }
    }
  }

  return errors;
}

/**
 * Validates that all parameter references in rules exist
 */
function validateReferences(graph: CanonicalGraph): NormalizationError[] {
  const errors: NormalizationError[] = [];

  for (const rule of Object.values(graph.rules)) {
    for (const inputId of rule.inputs) {
      if (!graph.parameters[inputId]) {
        errors.push(Errors.undeclaredParameter(inputId, rule.id));
      }
    }
    for (const outputId of rule.outputs) {
      if (!graph.parameters[outputId]) {
        errors.push(Errors.undeclaredParameter(outputId, rule.id));
      }
    }
  }

  return errors;
}

/**
 * Validates that each rule has at least one output
 */
function validateRuleOutputs(graph: CanonicalGraph): NormalizationError[] {
  const errors: NormalizationError[] = [];

  for (const rule of Object.values(graph.rules)) {
    if (rule.outputs.length === 0) {
      errors.push(Errors.ruleNoOutputs(rule.id));
    }
  }

  return errors;
}

/**
 * Main validation function
 * 
 * Validates all structural and logical constraints on a canonical graph.
 */
export function validateCanonicalGraph(graph: CanonicalGraph): Result<CanonicalGraph> {
  const errors: NormalizationError[] = [];

  // Validate references
  errors.push(...validateReferences(graph));

  // Validate bipartite structure
  errors.push(...validateBipartite(graph));

  // Validate rule outputs
  errors.push(...validateRuleOutputs(graph));

  // Check for cycles
  const { hasCycle, cyclePath } = topologicalSort(graph);
  if (hasCycle) {
    const cycleStr = cyclePath?.map(id => id.replace(/^(param|rule):/, '')) || [];
    errors.push(Errors.cycleDetected(cycleStr));
  }

  if (errors.length > 0) {
    return err(errors);
  }

  return ok(graph);
}

/**
 * Gets the topological order of nodes in the graph
 * Useful for visualization layout
 */
export function getTopologicalOrder(graph: CanonicalGraph): string[] {
  const { sorted, hasCycle } = topologicalSort(graph);
  if (hasCycle) {
    return [];
  }
  return sorted.map(id => id.replace(/^(param|rule):/, ''));
}

