/**
 * Graphviz Renderer
 *
 * Implementation of GraphRenderer interface using Graphviz WASM.
 * This is the concrete rendering backend that can be replaced.
 */

import { instance } from "@viz-js/viz";
import type {
  VisualGraph,
  RenderResult,
  GraphRenderer,
} from "../../shared/types/visual";
import { visualToDot } from "./visual-to-dot";

// Singleton Viz instance
let vizInstance: Awaited<ReturnType<typeof instance>> | null = null;

/**
 * Initializes the Graphviz WASM instance
 */
async function getViz(): Promise<Awaited<ReturnType<typeof instance>>> {
  if (!vizInstance) {
    vizInstance = await instance();
  }
  return vizInstance;
}

/**
 * Graphviz renderer implementation
 */
export class GraphvizRenderer implements GraphRenderer {
  /**
   * Renders a visual graph to SVG using Graphviz
   */
  async render(graph: VisualGraph): Promise<RenderResult> {
    const viz = await getViz();
    const dot = visualToDot(graph);

    console.log(`${dot}`);

    try {
      const svg = viz.renderSVGElement(dot);
      const svgString = svg.outerHTML;

      // Extract dimensions from SVG
      const width = parseInt(svg.getAttribute("width") || "400", 10);
      const height = parseInt(svg.getAttribute("height") || "300", 10);

      return {
        svg: svgString,
        width,
        height,
      };
    } catch (error) {
      // Return error message as SVG
      const errorMessage =
        error instanceof Error ? error.message : "Rendering failed";
      return {
        svg: createErrorSvg(errorMessage),
        width: 400,
        height: 100,
      };
    }
  }
}

/**
 * Creates an SVG displaying an error message
 */
function createErrorSvg(message: string): string {
  const escapedMessage = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="100">
      <rect width="100%" height="100%" fill="#fee2e2" rx="8"/>
      <text x="20" y="35" fill="#dc2626" font-family="sans-serif" font-size="14" font-weight="bold">
        Rendering Error
      </text>
      <text x="20" y="60" fill="#991b1b" font-family="sans-serif" font-size="12">
        ${escapedMessage}
      </text>
    </svg>
  `.trim();
}

/**
 * Singleton renderer instance
 */
let rendererInstance: GraphvizRenderer | null = null;

/**
 * Gets the singleton Graphviz renderer
 */
export function getRenderer(): GraphRenderer {
  if (!rendererInstance) {
    rendererInstance = new GraphvizRenderer();
  }
  return rendererInstance;
}

/**
 * Renders a visual graph using the default renderer
 */
export async function renderGraph(graph: VisualGraph): Promise<RenderResult> {
  const renderer = getRenderer();
  return renderer.render(graph);
}
