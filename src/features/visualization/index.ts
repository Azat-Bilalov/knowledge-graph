/**
 * Visualization Module
 * 
 * Public API for graph visualization pipeline.
 */

export { canonicalToVisual } from './canonical-to-visual';
export { visualToDot } from './visual-to-dot';
export { GraphvizRenderer, getRenderer, renderGraph } from './graphviz-renderer';

import type { CanonicalGraph } from '../../shared/types/canonical';
import type { VisualGraph, RenderResult } from '../../shared/types/visual';
import { canonicalToVisual } from './canonical-to-visual';
import { renderGraph } from './graphviz-renderer';

/**
 * Complete visualization pipeline: Canonical → Visual → Rendered SVG
 */
export async function visualize(graph: CanonicalGraph): Promise<RenderResult> {
  const visualGraph = canonicalToVisual(graph);
  return renderGraph(visualGraph);
}

/**
 * Gets the visual graph without rendering (for inspection/debugging)
 */
export function toVisualGraph(graph: CanonicalGraph): VisualGraph {
  return canonicalToVisual(graph);
}

