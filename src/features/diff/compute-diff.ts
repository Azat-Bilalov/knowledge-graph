/**
 * Diff Engine
 *
 * Computes structural differences between multiple canonical graphs.
 * Produces a unified diff graph with presence information and agreement metrics.
 */

import type {
  CanonicalParameter,
  CanonicalRule,
} from "../../shared/types/canonical";
import type {
  DiffGraph,
  DiffParameter,
  DiffRule,
  DiffEdge,
  AgreementMetrics,
  DiffResult,
  LabeledGraph,
  PresenceVector,
} from "../../shared/types/diff";
import type {
  AgreementStatus,
  VisualGraph,
  VisualNode,
  VisualEdge,
} from "../../shared/types/visual";
import { DIFF_COLORS, DIFF_EDGE_STYLES } from "../../shared/types/diff";

/**
 * Computes the agreement status based on presence vector
 */
function computeStatus(presence: PresenceVector): AgreementStatus {
  if (presence.presentIn.length === presence.totalSources) {
    return "common";
  }
  if (presence.presentIn.length === 1) {
    return "unique";
  }
  return "partial";
}

/**
 * Creates a canonical string key for a rule (for comparison)
 * Rules are identical if: rule_id, inputs, outputs, and logic match exactly
 */
function ruleKey(rule: CanonicalRule): string {
  const sortedInputs = [...rule.inputs].sort().join(",");
  const sortedOutputs = [...rule.outputs].sort().join(",");
  return `${rule.id}|${sortedInputs}|${sortedOutputs}|${rule.logic}`;
}

/**
 * Creates a sanitized ID for use in DOT graphs
 */
function sanitizeId(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .substring(0, 50); // Limit length
}

/**
 * Creates a canonical string key for an edge
 */
function edgeKey(from: string, to: string): string {
  return `${from}|${to}`;
}

/**
 * Computes the diff between multiple canonical graphs
 */
export function computeDiff(labeledGraphs: LabeledGraph[]): DiffResult {
  if (labeledGraphs.length < 2) {
    throw new Error("Diff requires at least 2 graphs");
  }

  const sources = labeledGraphs.map((g) => g.label);
  const totalSources = sources.length;

  // Unified sets with presence tracking
  const parameterMap = new Map<
    string,
    { param: CanonicalParameter; presentIn: Set<string> }
  >();
  const ruleMap = new Map<
    string,
    { rule: CanonicalRule; visualId: string; presentIn: Set<string> }
  >();
  const edgeMap = new Map<
    string,
    { from: string; to: string; presentIn: Set<string> }
  >();

  // Counter for generating unique visual IDs for rules
  let ruleCounter = 0;

  // Process each graph
  for (const { label, graph } of labeledGraphs) {
    // Collect parameters
    for (const param of Object.values(graph.parameters)) {
      const existing = parameterMap.get(param.id);
      if (existing) {
        existing.presentIn.add(label);
      } else {
        parameterMap.set(param.id, {
          param,
          presentIn: new Set([label]),
        });
      }
    }

    // Collect rules (by exact match) and their edges
    for (const rule of Object.values(graph.rules)) {
      const key = ruleKey(rule);
      let ruleVisualId: string;

      const existing = ruleMap.get(key);
      if (existing) {
        existing.presentIn.add(label);
        ruleVisualId = existing.visualId;
      } else {
        // Generate a unique visual ID for this rule
        ruleCounter++;
        ruleVisualId = `rule_${ruleCounter}_${sanitizeId(rule.id)}`;
        ruleMap.set(key, {
          rule,
          visualId: ruleVisualId,
          presentIn: new Set([label]),
        });
      }

      // Collect edges using the visual ID (not rule.id)
      for (const inputId of rule.inputs) {
        const key = edgeKey(inputId, ruleVisualId);
        const existing = edgeMap.get(key);
        if (existing) {
          existing.presentIn.add(label);
        } else {
          edgeMap.set(key, {
            from: inputId,
            to: ruleVisualId,
            presentIn: new Set([label]),
          });
        }
      }

      for (const outputId of rule.outputs) {
        const key = edgeKey(ruleVisualId, outputId);
        const existing = edgeMap.get(key);
        if (existing) {
          existing.presentIn.add(label);
        } else {
          edgeMap.set(key, {
            from: ruleVisualId,
            to: outputId,
            presentIn: new Set([label]),
          });
        }
      }
    }
  }

  // Build diff parameters
  const diffParameters: Record<string, DiffParameter> = {};
  for (const [id, { param, presentIn }] of parameterMap) {
    const presence: PresenceVector = {
      presentIn: [...presentIn],
      totalSources,
    };
    diffParameters[id] = {
      ...param,
      presence,
      status: computeStatus(presence),
    };
  }

  // Build diff rules with visual IDs
  const diffRules: Record<string, DiffRule & { visualId: string }> = {};
  for (const [key, { rule, visualId, presentIn }] of ruleMap) {
    const presence: PresenceVector = {
      presentIn: [...presentIn],
      totalSources,
    };
    diffRules[key] = {
      ...rule,
      visualId,
      presence,
      status: computeStatus(presence),
    };
  }

  // Build diff edges
  const diffEdges: DiffEdge[] = [];
  for (const [, { from, to, presentIn }] of edgeMap) {
    const presence: PresenceVector = {
      presentIn: [...presentIn],
      totalSources,
    };
    diffEdges.push({
      from,
      to,
      presence,
      status: computeStatus(presence),
    });
  }

  // Build diff graph (cast to remove visualId from type for external interface)
  const diffGraph: DiffGraph = {
    parameters: diffParameters,
    rules: diffRules as unknown as Record<string, DiffRule>,
    edges: diffEdges,
    sources,
  };

  // Compute metrics
  const metrics = computeMetrics(diffGraph);

  // Generate visual graph (use our extended diffRules with visualId)
  const visualGraph = diffToVisual(diffParameters, diffRules, diffEdges);

  return {
    diffGraph,
    metrics,
    visualGraph,
  };
}

/**
 * Computes agreement metrics from a diff graph
 */
function computeMetrics(diffGraph: DiffGraph): AgreementMetrics {
  const params = Object.values(diffGraph.parameters);
  const rules = Object.values(diffGraph.rules);
  const edges = diffGraph.edges;

  return {
    parameters: {
      total: params.length,
      common: params.filter((p) => p.status === "common").length,
      partial: params.filter((p) => p.status === "partial").length,
      unique: params.filter((p) => p.status === "unique").length,
    },
    rules: {
      total: rules.length,
      common: rules.filter((r) => r.status === "common").length,
      partial: rules.filter((r) => r.status === "partial").length,
      unique: rules.filter((r) => r.status === "unique").length,
    },
    edges: {
      total: edges.length,
      common: edges.filter((e) => e.status === "common").length,
      partial: edges.filter((e) => e.status === "partial").length,
      unique: edges.filter((e) => e.status === "unique").length,
    },
  };
}

/**
 * Converts diff data to visual graph with color coding
 */
function diffToVisual(
  diffParameters: Record<string, DiffParameter>,
  diffRules: Record<string, DiffRule & { visualId: string }>,
  diffEdges: DiffEdge[]
): VisualGraph {
  const nodes: VisualNode[] = [];
  const edges: VisualEdge[] = [];

  // Create parameter nodes with diff coloring
  for (const param of Object.values(diffParameters)) {
    const presenceLabel = `(${param.presence.presentIn.length}/${param.presence.totalSources})`;
    nodes.push({
      id: param.id,
      label: `${param.id}\\n${presenceLabel}`,
      shape: "ellipse",
      style: param.source === "derived" ? ["dashed"] : ["solid"],
      color: DIFF_COLORS[param.status],
      presentIn: param.presence.presentIn,
      agreementStatus: param.status,
      metadata: {
        type: param.type,
        source: param.source,
      },
    });
  }

  // Create rule nodes with diff coloring using pre-assigned visual IDs
  for (const rule of Object.values(diffRules)) {
    const presenceLabel = `(${rule.presence.presentIn.length}/${rule.presence.totalSources})`;

    nodes.push({
      id: rule.visualId,
      label: `${rule.id}\\n${presenceLabel}`,
      shape: "box",
      style: ["rounded", "filled"],
      color: DIFF_COLORS[rule.status],
      fillColor:
        rule.status === "common"
          ? "lightgray"
          : rule.status === "partial"
          ? "#ffe4b5"
          : "#ffcccb",
      presentIn: rule.presence.presentIn,
      agreementStatus: rule.status,
      metadata: {
        inputs: rule.inputs,
        outputs: rule.outputs,
        logic: rule.logic,
      },
    });
  }

  // Create edges with diff styling
  for (const edge of diffEdges) {
    edges.push({
      from: edge.from,
      to: edge.to,
      style: DIFF_EDGE_STYLES[edge.status],
      color: DIFF_COLORS[edge.status],
      arrowhead: "normal",
      presentIn: edge.presence.presentIn,
      agreementStatus: edge.status,
    });
  }

  return {
    nodes,
    edges,
    direction: "LR",
  };
}
