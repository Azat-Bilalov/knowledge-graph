/**
 * Canonical Model → Visual Graph Mapping
 * 
 * Converts canonical knowledge graph into visual graph abstraction.
 * This is an intermediate step before rendering with Graphviz.
 */

import type { CanonicalGraph, CanonicalParameter, CanonicalRule } from '../../shared/types/canonical';
import type { VisualGraph, VisualNode, VisualEdge, ParameterNodeMetadata, RuleNodeMetadata } from '../../shared/types/visual';

/**
 * Creates a visual node from a canonical parameter
 */
function createParameterNode(param: CanonicalParameter): VisualNode {
  const metadata: ParameterNodeMetadata = {
    type: param.type,
    source: param.source,
  };

  return {
    id: param.id,
    label: param.id,
    shape: 'ellipse',
    style: param.source === 'derived' ? ['dashed'] : ['solid'],
    color: 'black',
    metadata,
  };
}

/**
 * Creates a visual node from a canonical rule
 */
function createRuleNode(rule: CanonicalRule): VisualNode {
  const metadata: RuleNodeMetadata = {
    inputs: rule.inputs,
    outputs: rule.outputs,
    logic: rule.logic,
  };

  return {
    id: rule.id,
    label: rule.id,
    shape: 'box',
    style: ['rounded', 'filled'],
    color: 'black',
    fillColor: 'lightgray',
    metadata,
  };
}

/**
 * Creates input edges (Parameter → Rule)
 */
function createInputEdges(rule: CanonicalRule): VisualEdge[] {
  return rule.inputs.map(inputId => ({
    from: inputId,
    to: rule.id,
    style: 'solid' as const,
    color: 'black',
    arrowhead: 'normal',
  }));
}

/**
 * Creates output edges (Rule → Parameter)
 */
function createOutputEdges(rule: CanonicalRule): VisualEdge[] {
  return rule.outputs.map(outputId => ({
    from: rule.id,
    to: outputId,
    style: 'solid' as const,
    color: 'black',
    arrowhead: 'normal',
  }));
}

/**
 * Converts a canonical graph into a visual graph
 */
export function canonicalToVisual(graph: CanonicalGraph): VisualGraph {
  const nodes: VisualNode[] = [];
  const edges: VisualEdge[] = [];

  // Create parameter nodes
  for (const param of Object.values(graph.parameters)) {
    nodes.push(createParameterNode(param));
  }

  // Create rule nodes and edges
  for (const rule of Object.values(graph.rules)) {
    nodes.push(createRuleNode(rule));
    edges.push(...createInputEdges(rule));
    edges.push(...createOutputEdges(rule));
  }

  return {
    nodes,
    edges,
    direction: 'LR',
  };
}

