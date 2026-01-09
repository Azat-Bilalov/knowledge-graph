/**
 * Format B Normalizer
 * 
 * Format B — Linear Rule Pipeline
 * Inputs and outputs are inferred by static analysis of logic.
 */

import type { FormatB } from '../../shared/types/formats';
import type { CanonicalGraph, CanonicalParameter, CanonicalRule } from '../../shared/types/canonical';
import type { NormalizationError, Result } from '../../shared/types/errors';
import { ok, err, Errors } from '../../shared/types/errors';
import { normalizeId, isValidId } from '../../shared/lib/normalize-id';
import { analyzeLogic } from '../../shared/lib/parse-logic';

/**
 * Validates and normalizes Format B input into canonical model
 */
export function normalizeFormatB(input: FormatB): Result<CanonicalGraph> {
  const errors: NormalizationError[] = [];
  const parameters: Record<string, CanonicalParameter> = {};
  const rules: Record<string, CanonicalRule> = {};
  const outputWriters: Map<string, string> = new Map();

  // Step 1: Build parameter registry from declared parameters
  for (const [rawId, paramDef] of Object.entries(input.parameters || {})) {
    const id = normalizeId(rawId);
    
    if (!isValidId(rawId)) {
      errors.push(Errors.emptyParameterName({ format: 'B', parameter: rawId }));
      continue;
    }

    if (!paramDef.type || !['number', 'boolean', 'string'].includes(paramDef.type)) {
      errors.push(Errors.missingType(id, { format: 'B' }));
      continue;
    }

    parameters[id] = {
      id,
      type: paramDef.type,
      description: paramDef.description,
      source: 'input',
    };
  }

  // Step 2: Process pipeline rules in order
  if (!Array.isArray(input.pipeline)) {
    errors.push(Errors.schemaMismatch('pipeline must be an array', { format: 'B' }));
    return err(errors);
  }

  // Track which parameters have been "defined" for dependency checking
  const definedParams = new Set(Object.keys(parameters));

  for (const step of input.pipeline) {
    const ruleId = normalizeId(step.rule_id || '');
    
    if (!ruleId) {
      errors.push(Errors.validationError('Pipeline step must have a rule_id', { format: 'B' }));
      continue;
    }

    // Analyze logic to infer inputs and outputs
    const { inputs: rawInputs, outputs: rawOutputs } = analyzeLogic(step.logic || '');
    
    const normalizedInputs: string[] = [];
    const normalizedOutputs: string[] = [];

    // Process outputs first (they are written to)
    for (const outputParam of rawOutputs) {
      const normalized = normalizeId(outputParam);
      if (!parameters[normalized]) {
        errors.push(Errors.undeclaredParameter(normalized, ruleId, { format: 'B' }));
        continue;
      }
      
      // Check for duplicate writers
      const existingWriter = outputWriters.get(normalized);
      if (existingWriter) {
        errors.push(Errors.duplicateOutput(normalized, ruleId, existingWriter, { format: 'B' }));
      } else {
        outputWriters.set(normalized, ruleId);
        parameters[normalized].source = 'derived';
        normalizedOutputs.push(normalized);
        definedParams.add(normalized);
      }
    }

    // Process inputs (they must be previously defined in pipeline order)
    for (const inputParam of rawInputs) {
      const normalized = normalizeId(inputParam);
      if (!parameters[normalized]) {
        errors.push(Errors.undeclaredParameter(normalized, ruleId, { format: 'B' }));
        continue;
      }
      normalizedInputs.push(normalized);
    }

    if (normalizedOutputs.length === 0) {
      errors.push(Errors.ruleNoOutputs(ruleId, { format: 'B' }));
      continue;
    }

    rules[ruleId] = {
      id: ruleId,
      inputs: [...new Set(normalizedInputs)], // Remove duplicates
      outputs: [...new Set(normalizedOutputs)],
      logic: step.logic || '',
    };
  }

  if (errors.length > 0) {
    return err(errors);
  }

  return ok({ parameters, rules });
}

