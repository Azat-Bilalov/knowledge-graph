/**
 * Diff Graph Types
 * 
 * Types for comparing multiple canonical graphs and representing differences.
 */

import type { CanonicalGraph, CanonicalParameter, CanonicalRule } from './canonical';
import type { AgreementStatus, VisualGraph } from './visual';

/**
 * Presence vector indicating which LLMs contain an entity
 */
export interface PresenceVector {
  presentIn: string[];
  totalSources: number;
}

/**
 * Parameter with presence information for diff
 */
export interface DiffParameter extends CanonicalParameter {
  presence: PresenceVector;
  status: AgreementStatus;
}

/**
 * Rule with presence information for diff
 */
export interface DiffRule extends CanonicalRule {
  presence: PresenceVector;
  status: AgreementStatus;
}

/**
 * Edge representation for diff comparison
 */
export interface DiffEdge {
  from: string;
  to: string;
  presence: PresenceVector;
  status: AgreementStatus;
}

/**
 * Complete diff graph containing unified sets with presence information
 */
export interface DiffGraph {
  parameters: Record<string, DiffParameter>;
  rules: Record<string, DiffRule>;
  edges: DiffEdge[];
  sources: string[];
}

/**
 * Agreement metrics for the diff
 */
export interface AgreementMetrics {
  parameters: {
    total: number;
    common: number;
    partial: number;
    unique: number;
  };
  rules: {
    total: number;
    common: number;
    partial: number;
    unique: number;
  };
  edges: {
    total: number;
    common: number;
    partial: number;
    unique: number;
  };
}

/**
 * Complete diff result including graph, metrics, and visual representation
 */
export interface DiffResult {
  diffGraph: DiffGraph;
  metrics: AgreementMetrics;
  visualGraph: VisualGraph;
}

/**
 * Input for diff computation
 */
export interface LabeledGraph {
  label: string;
  graph: CanonicalGraph;
}

/**
 * Color coding for diff visualization
 */
export const DIFF_COLORS: Record<AgreementStatus, string> = {
  common: 'black',
  partial: 'orange',
  unique: 'red',
};

/**
 * Edge styles for diff visualization
 */
export const DIFF_EDGE_STYLES: Record<AgreementStatus, 'solid' | 'dashed' | 'bold'> = {
  common: 'solid',
  partial: 'dashed',
  unique: 'bold',
};

