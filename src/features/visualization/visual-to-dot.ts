/**
 * Visual Graph → Graphviz DOT Mapping
 *
 * Converts visual graph abstraction into Graphviz DOT language string.
 * This is the rendering backend implementation.
 */

import type {
  VisualGraph,
  VisualNode,
  VisualEdge,
} from "../../shared/types/visual";

/**
 * Escapes a string for use in DOT labels (non-HTML)
 */
function escapeLabel(label: string): string {
  return label
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

/**
 * Escapes a string for use in HTML-like DOT labels
 */
function escapeHtmlLabel(label: string): string {
  return label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Creates an HTML-like label for a node that handles multi-line text properly
 */
function createHtmlLabel(node: VisualNode): string {
  // Split label by \n to handle multi-line
  const parts = node.label.split("\\n");

  // Determine font color based on agreement status
  let fontColor = "black";
  if (node.agreementStatus === "unique") {
    fontColor = "red";
  } else if (node.agreementStatus === "partial") {
    fontColor = "darkorange";
  }

  // Build HTML table for proper text containment
  const rows = parts.map((part, i) => {
    const escaped = escapeHtmlLabel(part);
    if (i === 0) {
      // Main label - slightly larger
      return `<TR><TD><FONT COLOR="${fontColor}" POINT-SIZE="11">${escaped}</FONT></TD></TR>`;
    } else {
      // Secondary info (like presence count) - smaller
      return `<TR><TD><FONT COLOR="${fontColor}" POINT-SIZE="9">${escaped}</FONT></TD></TR>`;
    }
  });

  return `<<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="4">${rows.join(
    ""
  )}</TABLE>>`;
}

/**
 * Converts a visual node to DOT node declaration
 */
function nodeToDot(node: VisualNode): string {
  const attributes: string[] = [];

  // Shape
  attributes.push(`shape=${node.shape}`);

  // Use HTML label for better text control
  const htmlLabel = createHtmlLabel(node);
  attributes.push(`label=${htmlLabel}`);

  // Style
  if (node.style.length > 0) {
    attributes.push(`style="${node.style.join(",")}"`);
  }

  // Color (border)
  if (node.color) {
    attributes.push(`color=${node.color}`);
  }

  // Fill color (quote if contains special characters like #)
  if (node.fillColor) {
    const fc = node.fillColor.includes("#")
      ? `"${node.fillColor}"`
      : node.fillColor;
    attributes.push(`fillcolor=${fc}`);
  }

  // Add presence info as tooltip for diff graphs
  if (node.presentIn && node.presentIn.length > 0) {
    const tooltip = `Present in: ${node.presentIn.join(", ")}`;
    attributes.push(`tooltip="${escapeLabel(tooltip)}"`);
  }

  // Ensure node auto-sizes to fit label with proper padding
  attributes.push('margin="0.15"');

  return `  "${escapeLabel(node.id)}" [${attributes.join(", ")}];`;
}

/**
 * Converts a visual edge to DOT edge declaration
 */
function edgeToDot(edge: VisualEdge): string {
  const attributes: string[] = [];

  // Style
  attributes.push(`style=${edge.style}`);

  // Color
  if (edge.color) {
    attributes.push(`color=${edge.color}`);
  }

  // Arrowhead
  if (edge.arrowhead) {
    attributes.push(`arrowhead=${edge.arrowhead}`);
  }

  // Penwidth for emphasis
  if (edge.style === "bold") {
    attributes.push("penwidth=2");
  }

  // Add presence info as tooltip for diff graphs
  if (edge.presentIn && edge.presentIn.length > 0) {
    const tooltip = `Present in: ${edge.presentIn.join(", ")}`;
    attributes.push(`tooltip="${escapeLabel(tooltip)}"`);
  }

  const from = escapeLabel(edge.from);
  const to = escapeLabel(edge.to);

  return `  "${from}" -> "${to}" [${attributes.join(", ")}];`;
}

/**
 * Converts a visual graph to complete DOT language string
 */
export function visualToDot(graph: VisualGraph): string {
  const lines: string[] = [];

  // Graph declaration
  lines.push("digraph KnowledgeGraph {");

  // Graph attributes
  lines.push(`  rankdir=${graph.direction};`);
  lines.push("  graph [nodesep=0.6, ranksep=1.0];");
  lines.push('  node [fontname="Helvetica, Arial, sans-serif", fontsize=11];');
  lines.push('  edge [fontname="Helvetica, Arial, sans-serif", fontsize=9];');
  lines.push("");

  // Separate parameter and rule nodes for better layout
  const paramNodes = graph.nodes.filter((n) => n.shape === "ellipse");
  const ruleNodes = graph.nodes.filter((n) => n.shape === "box");

  // Parameter nodes
  if (paramNodes.length > 0) {
    lines.push("  // Parameter nodes");
    for (const node of paramNodes) {
      lines.push(nodeToDot(node));
    }
    lines.push("");
  }

  // Rule nodes
  if (ruleNodes.length > 0) {
    lines.push("  // Rule nodes");
    for (const node of ruleNodes) {
      lines.push(nodeToDot(node));
    }
    lines.push("");
  }

  // Edges
  if (graph.edges.length > 0) {
    lines.push("  // Edges");
    for (const edge of graph.edges) {
      lines.push(edgeToDot(edge));
    }
  }

  lines.push("}");

  return lines.join("\n");
}
