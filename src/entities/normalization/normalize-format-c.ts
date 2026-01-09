/**
 * Format C Normalizer
 * 
 * Format C — Atomic Rule Blocks
 * Each rule is self-contained with its own typed inputs and outputs.
 */

import type { FormatC } from '../../shared/types/formats';
import type { CanonicalGraph, CanonicalParameter, CanonicalRule, ParameterType } from '../../shared/types/canonical';
import type { NormalizationError, Result } from '../../shared/types/errors';
import { ok, err, Errors } from '../../shared/types/errors';
import { normalizeId, isValidId } from '../../shared/lib/normalize-id';

/**
 * Validates and normalizes Format C input into canonical model
 */
export function normalizeFormatC(input: FormatC): Result<CanonicalGraph> {
  const errors: NormalizationError[] = [];
  const parameters: Record<string, CanonicalParameter> = {};
  const rules: Record<string, CanonicalRule> = {};
  const outputWriters: Map<string, string> = new Map();

  // Track parameter types for conflict detection
  const paramTypes: Map<string, ParameterType> = new Map();

  if (!Array.isArray(input)) {
    errors.push(Errors.schemaMismatch('Format C must be an array of rules', { format: 'C' }));
    return err(errors);
  }

  for (const block of input) {
    const ruleId = normalizeId(block.rule_id || '');
    
    if (!ruleId) {
      errors.push(Errors.validationError('Rule block must have a rule_id', { format: 'C' }));
      continue;
    }

    const normalizedInputs: string[] = [];
    const normalizedOutputs: string[] = [];

    // Process input parameters (aggregate into global registry)
    for (const inputParam of block.input_parameters || []) {
      const id = normalizeId(inputParam.name || '');
      
      if (!isValidId(inputParam.name || '')) {
        errors.push(Errors.emptyParameterName({ format: 'C', ruleId }));
        continue;
      }

      if (!inputParam.type || !['number', 'boolean', 'string'].includes(inputParam.type)) {
        errors.push(Errors.missingType(id, { format: 'C', ruleId }));
        continue;
      }

      // Check for type conflicts
      const existingType = paramTypes.get(id);
      if (existingType && existingType !== inputParam.type) {
        errors.push(Errors.conflictingType(id, existingType, inputParam.type, { format: 'C', ruleId }));
        continue;
      }

      paramTypes.set(id, inputParam.type);
      
      if (!parameters[id]) {
        parameters[id] = {
          id,
          type: inputParam.type,
          source: 'input',
        };
      }
      
      normalizedInputs.push(id);
    }

    // Process output parameters
    for (const outputParam of block.output_parameters || []) {
      const id = normalizeId(outputParam.name || '');
      
      if (!isValidId(outputParam.name || '')) {
        errors.push(Errors.emptyParameterName({ format: 'C', ruleId }));
        continue;
      }

      if (!outputParam.type || !['number', 'boolean', 'string'].includes(outputParam.type)) {
        errors.push(Errors.missingType(id, { format: 'C', ruleId }));
        continue;
      }

      // Check for type conflicts
      const existingType = paramTypes.get(id);
      if (existingType && existingType !== outputParam.type) {
        errors.push(Errors.conflictingType(id, existingType, outputParam.type, { format: 'C', ruleId }));
        continue;
      }

      paramTypes.set(id, outputParam.type);

      // Check for duplicate writers
      const existingWriter = outputWriters.get(id);
      if (existingWriter) {
        errors.push(Errors.duplicateOutput(id, ruleId, existingWriter, { format: 'C' }));
        continue;
      }

      outputWriters.set(id, ruleId);

      if (!parameters[id]) {
        parameters[id] = {
          id,
          type: outputParam.type,
          source: 'derived',
        };
      } else {
        parameters[id].source = 'derived';
      }
      
      normalizedOutputs.push(id);
    }

    if (normalizedOutputs.length === 0) {
      errors.push(Errors.ruleNoOutputs(ruleId, { format: 'C' }));
      continue;
    }

    rules[ruleId] = {
      id: ruleId,
      inputs: [...new Set(normalizedInputs)],
      outputs: [...new Set(normalizedOutputs)],
      logic: block.logic || '',
    };
  }

  if (errors.length > 0) {
    return err(errors);
  }

  return ok({ parameters, rules });
}

