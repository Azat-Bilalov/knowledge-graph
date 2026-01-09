/**
 * Normalization Engine
 * 
 * Main entry point for normalizing any input format into canonical model.
 * Supports formats A, B, C, D with deterministic output.
 */

import type { FormatType, FormatA, FormatB, FormatC, FormatD } from '../../shared/types/formats';
import type { CanonicalGraph } from '../../shared/types/canonical';
import type { Result } from '../../shared/types/errors';
import { err, Errors } from '../../shared/types/errors';

import { normalizeFormatA } from './normalize-format-a';
import { normalizeFormatB } from './normalize-format-b';
import { normalizeFormatC } from './normalize-format-c';
import { normalizeFormatD } from './normalize-format-d';

export { normalizeFormatA } from './normalize-format-a';
export { normalizeFormatB } from './normalize-format-b';
export { normalizeFormatC } from './normalize-format-c';
export { normalizeFormatD } from './normalize-format-d';

/**
 * Parses JSON input and returns typed data or error
 */
function parseJson(input: string, format: FormatType): Result<unknown> {
  try {
    const parsed = JSON.parse(input);
    return { success: true, value: parsed };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON';
    return err([Errors.invalidJson(message, { format })]);
  }
}

/**
 * Validates basic schema structure for Format A
 */
function isFormatA(data: unknown): data is FormatA {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.parameters === 'object' &&
    obj.parameters !== null &&
    Array.isArray(obj.rules)
  );
}

/**
 * Validates basic schema structure for Format B
 */
function isFormatB(data: unknown): data is FormatB {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.parameters === 'object' &&
    obj.parameters !== null &&
    Array.isArray(obj.pipeline)
  );
}

/**
 * Validates basic schema structure for Format C
 */
function isFormatC(data: unknown): data is FormatC {
  return Array.isArray(data);
}

/**
 * Validates basic schema structure for Format D
 */
function isFormatD(data: unknown): data is FormatD {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return false;
  // Format D is an object where each key maps to a parameter definition with type
  const obj = data as Record<string, unknown>;
  // Must have at least one parameter and should not have 'rules' or 'pipeline' keys
  return !('rules' in obj) && !('pipeline' in obj);
}

/**
 * Main normalization function
 * 
 * Takes raw JSON text and declared format, returns canonical graph or errors.
 * This is the primary entry point for the normalization engine.
 */
export function normalize(
  input: string,
  format: FormatType
): Result<CanonicalGraph> {
  // Step 1: Parse JSON
  const parseResult = parseJson(input, format);
  if (!parseResult.success) {
    return parseResult;
  }

  const data = parseResult.value;

  // Step 2: Validate schema and normalize based on format
  switch (format) {
    case 'A':
      if (!isFormatA(data)) {
        return err([Errors.schemaMismatch(
          'Format A requires "parameters" object and "rules" array',
          { format: 'A' }
        )]);
      }
      return normalizeFormatA(data);

    case 'B':
      if (!isFormatB(data)) {
        return err([Errors.schemaMismatch(
          'Format B requires "parameters" object and "pipeline" array',
          { format: 'B' }
        )]);
      }
      return normalizeFormatB(data);

    case 'C':
      if (!isFormatC(data)) {
        return err([Errors.schemaMismatch(
          'Format C must be an array of rule blocks',
          { format: 'C' }
        )]);
      }
      return normalizeFormatC(data);

    case 'D':
      if (!isFormatD(data)) {
        return err([Errors.schemaMismatch(
          'Format D must be an object mapping parameters to definitions',
          { format: 'D' }
        )]);
      }
      return normalizeFormatD(data);

    default:
      return err([Errors.validationError(`Unknown format: ${format}`, {})]);
  }
}

/**
 * Batch normalization for multiple inputs
 * Returns results for each input, allowing partial failures
 */
export function normalizeAll(
  inputs: Array<{ label: string; content: string; format: FormatType }>
): Array<{ label: string; result: Result<CanonicalGraph> }> {
  return inputs.map(({ label, content, format }) => ({
    label,
    result: normalize(content, format),
  }));
}

