/**
 * Visual Graph Model
 * 
 * Intermediate representation between canonical model and rendering backend.
 * This abstraction allows Graphviz to be replaced without changing core logic.
 */

import type { ParameterType, ParameterSource } from './canonical';

/** Node shape types */
export type NodeShape = 'ellipse' | 'box';

/** Node style types */
export type NodeStyle = 'solid' | 'dashed' | 'rounded' | 'filled';

/** Edge style types */
export type EdgeStyle = 'solid' | 'dashed' | 'bold';

/** Agreement status for diff visualization */
export type AgreementStatus = 'common' | 'partial' | 'unique';

/**
 * Metadata for parameter nodes
 */
export interface ParameterNodeMetadata {
  type: ParameterType;
  source: ParameterSource;
}

/**
 * Metadata for rule nodes
 */
export interface RuleNodeMetadata {
  inputs: string[];
  outputs: string[];
  logic: string;
}

/**
 * Visual node representation
 */
export interface VisualNode {
  id: string;
  label: string;
  shape: NodeShape;
  style: NodeStyle[];
  color: string;
  fillColor?: string;
  metadata: ParameterNodeMetadata | RuleNodeMetadata;
  /** For diff graphs: which LLMs this node is present in */
  presentIn?: string[];
  /** For diff graphs: agreement status */
  agreementStatus?: AgreementStatus;
}

/**
 * Visual edge representation
 */
export interface VisualEdge {
  from: string;
  to: string;
  style: EdgeStyle;
  color: string;
  arrowhead: string;
  /** For diff graphs: which LLMs this edge is present in */
  presentIn?: string[];
  /** For diff graphs: agreement status */
  agreementStatus?: AgreementStatus;
}

/**
 * Complete visual graph representation
 */
export interface VisualGraph {
  nodes: VisualNode[];
  edges: VisualEdge[];
  direction: 'LR' | 'TB';
}

/**
 * Result of rendering a graph
 */
export interface RenderResult {
  svg: string;
  width: number;
  height: number;
}

/**
 * Renderer interface - allows backend replacement
 */
export interface GraphRenderer {
  render(graph: VisualGraph): Promise<RenderResult>;
}

/**
 * Empty visual graph for initialization
 */
export const EMPTY_VISUAL_GRAPH: VisualGraph = {
  nodes: [],
  edges: [],
  direction: 'LR',
};

