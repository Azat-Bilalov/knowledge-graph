/**
 * Shared Types - Public API
 */

// Canonical model types
export type {
  ParameterType,
  ParameterSource,
  CanonicalParameter,
  CanonicalRule,
  CanonicalGraph,
} from './canonical';

export {
  EMPTY_CANONICAL_GRAPH,
  createParameter,
  createRule,
} from './canonical';

// Format types
export type {
  FormatType,
  FormatA,
  FormatB,
  FormatC,
  FormatD,
  InputFormat,
} from './formats';

export { FORMAT_NAMES } from './formats';

// Error types
export type {
  ErrorType,
  ErrorLocation,
  NormalizationError,
  Result,
} from './errors';

export {
  ok,
  err,
  createError,
  Errors,
} from './errors';

// Visual types
export type {
  NodeShape,
  NodeStyle,
  EdgeStyle,
  AgreementStatus,
  ParameterNodeMetadata,
  RuleNodeMetadata,
  VisualNode,
  VisualEdge,
  VisualGraph,
  RenderResult,
  GraphRenderer,
} from './visual';

export { EMPTY_VISUAL_GRAPH } from './visual';

// Diff types
export type {
  PresenceVector,
  DiffParameter,
  DiffRule,
  DiffEdge,
  DiffGraph,
  AgreementMetrics,
  DiffResult,
  LabeledGraph,
} from './diff';

export { DIFF_COLORS, DIFF_EDGE_STYLES } from './diff';

