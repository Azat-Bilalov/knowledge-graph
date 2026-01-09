/**
 * Diff Module
 * 
 * Public API for multi-graph comparison.
 */

export { computeDiff } from './compute-diff';

import type { CanonicalGraph } from '../../shared/types/canonical';
import type { DiffResult, LabeledGraph } from '../../shared/types/diff';
import type { RenderResult } from '../../shared/types/visual';
import { computeDiff } from './compute-diff';
import { renderGraph } from '../visualization/graphviz-renderer';

/**
 * Computes diff and renders the diff graph
 */
export async function computeAndRenderDiff(
  labeledGraphs: LabeledGraph[]
): Promise<{ diff: DiffResult; rendered: RenderResult }> {
  const diff = computeDiff(labeledGraphs);
  const rendered = await renderGraph(diff.visualGraph);
  return { diff, rendered };
}

/**
 * Creates labeled graphs from an array of graphs with labels
 */
export function createLabeledGraphs(
  graphs: Array<{ label: string; graph: CanonicalGraph }>
): LabeledGraph[] {
  return graphs.map(({ label, graph }) => ({ label, graph }));
}

