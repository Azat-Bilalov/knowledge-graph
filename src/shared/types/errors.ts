/**
 * Error Types for Normalization and Validation
 * 
 * All errors are values, not thrown exceptions.
 * Errors propagate upward with context for UI rendering.
 */

import type { FormatType } from './formats';

/** Classification of error types */
export type ErrorType =
  | 'INVALID_JSON'
  | 'SCHEMA_MISMATCH'
  | 'UNKNOWN_FORMAT'
  | 'MISSING_TYPE'
  | 'CONFLICTING_TYPE'
  | 'EMPTY_PARAMETER_NAME'
  | 'UNDECLARED_PARAMETER'
  | 'RULE_NO_OUTPUTS'
  | 'DUPLICATE_OUTPUT'
  | 'CYCLE_DETECTED'
  | 'BIPARTITE_VIOLATION'
  | 'VALIDATION_ERROR';

/**
 * Location context for where an error occurred
 */
export interface ErrorLocation {
  format?: FormatType;
  ruleId?: string;
  parameter?: string;
  line?: number;
  column?: number;
}

/**
 * Structured normalization/validation error
 */
export interface NormalizationError {
  errorType: ErrorType;
  message: string;
  location: ErrorLocation;
}

/**
 * Result type for operations that can fail.
 * Either contains a success value or an array of errors.
 */
export type Result<T> =
  | { success: true; value: T }
  | { success: false; errors: NormalizationError[] };

/**
 * Creates a successful result
 */
export function ok<T>(value: T): Result<T> {
  return { success: true, value };
}

/**
 * Creates a failed result with errors
 */
export function err<T>(errors: NormalizationError[]): Result<T> {
  return { success: false, errors };
}

/**
 * Creates a single error with the given properties
 */
export function createError(
  errorType: ErrorType,
  message: string,
  location: ErrorLocation = {}
): NormalizationError {
  return { errorType, message, location };
}

/**
 * Helper to create common error types
 */
export const Errors = {
  invalidJson: (message: string, location: ErrorLocation = {}) =>
    createError('INVALID_JSON', message, location),

  schemaMismatch: (message: string, location: ErrorLocation = {}) =>
    createError('SCHEMA_MISMATCH', message, location),

  missingType: (parameter: string, location: ErrorLocation = {}) =>
    createError('MISSING_TYPE', `Missing type declaration for parameter: ${parameter}`, {
      ...location,
      parameter,
    }),

  conflictingType: (parameter: string, expected: string, actual: string, location: ErrorLocation = {}) =>
    createError(
      'CONFLICTING_TYPE',
      `Conflicting type for parameter "${parameter}": expected ${expected}, got ${actual}`,
      { ...location, parameter }
    ),

  emptyParameterName: (location: ErrorLocation = {}) =>
    createError('EMPTY_PARAMETER_NAME', 'Parameter name cannot be empty', location),

  undeclaredParameter: (parameter: string, ruleId: string, location: ErrorLocation = {}) =>
    createError(
      'UNDECLARED_PARAMETER',
      `Rule "${ruleId}" references undeclared parameter: ${parameter}`,
      { ...location, parameter, ruleId }
    ),

  ruleNoOutputs: (ruleId: string, location: ErrorLocation = {}) =>
    createError('RULE_NO_OUTPUTS', `Rule "${ruleId}" has no outputs`, {
      ...location,
      ruleId,
    }),

  duplicateOutput: (parameter: string, ruleId: string, existingRuleId: string, location: ErrorLocation = {}) =>
    createError(
      'DUPLICATE_OUTPUT',
      `Parameter "${parameter}" is written by multiple rules: "${existingRuleId}" and "${ruleId}"`,
      { ...location, parameter, ruleId }
    ),

  cycleDetected: (cycle: string[], location: ErrorLocation = {}) =>
    createError(
      'CYCLE_DETECTED',
      `Cycle detected in graph: ${cycle.join(' → ')}`,
      location
    ),

  bipartiteViolation: (message: string, location: ErrorLocation = {}) =>
    createError('BIPARTITE_VIOLATION', message, location),

  validationError: (message: string, location: ErrorLocation = {}) =>
    createError('VALIDATION_ERROR', message, location),
};

