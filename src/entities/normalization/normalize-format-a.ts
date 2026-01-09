/**
 * Format A Normalizer
 * 
 * Format A — Rule-as-Function Graph
 * Rules are taken directly with explicit inputs and outputs.
 */

import type { FormatA } from '../../shared/types/formats';
import type { CanonicalGraph, CanonicalParameter, CanonicalRule } from '../../shared/types/canonical';
import type { NormalizationError, Result } from '../../shared/types/errors';
import { ok, err, Errors } from '../../shared/types/errors';
import { normalizeId, isValidId } from '../../shared/lib/normalize-id';

/**
 * Validates and normalizes Format A input into canonical model
 */
export function normalizeFormatA(input: FormatA): Result<CanonicalGraph> {
  const errors: NormalizationError[] = [];
  const parameters: Record<string, CanonicalParameter> = {};
  const rules: Record<string, CanonicalRule> = {};
  const outputWriters: Map<string, string> = new Map(); // parameter -> rule that writes it

  // Step 1: Build parameter registry
  for (const [rawId, paramDef] of Object.entries(input.parameters)) {
    const id = normalizeId(rawId);
    
    if (!isValidId(rawId)) {
      errors.push(Errors.emptyParameterName({ format: 'A', parameter: rawId }));
      continue;
    }

    if (!paramDef.type || !['number', 'boolean', 'string'].includes(paramDef.type)) {
      errors.push(Errors.missingType(id, { format: 'A' }));
      continue;
    }

    parameters[id] = {
      id,
      type: paramDef.type,
      description: paramDef.description,
      source: 'input', // Will be updated to 'derived' for outputs
    };
  }

  // Step 2: Process rules
  if (!Array.isArray(input.rules)) {
    errors.push(Errors.schemaMismatch('rules must be an array', { format: 'A' }));
    return err(errors);
  }

  for (const rule of input.rules) {
    const ruleId = normalizeId(rule.id || '');
    
    if (!ruleId) {
      errors.push(Errors.validationError('Rule must have an id', { format: 'A' }));
      continue;
    }

    const normalizedInputs: string[] = [];
    const normalizedOutputs: string[] = [];

    // Validate inputs
    for (const inputParam of rule.inputs || []) {
      const normalizedInput = normalizeId(inputParam);
      if (!parameters[normalizedInput]) {
        errors.push(Errors.undeclaredParameter(normalizedInput, ruleId, { format: 'A' }));
      } else {
        normalizedInputs.push(normalizedInput);
      }
    }

    // Validate outputs
    for (const outputParam of rule.outputs || []) {
      const normalizedOutput = normalizeId(outputParam);
      if (!parameters[normalizedOutput]) {
        errors.push(Errors.undeclaredParameter(normalizedOutput, ruleId, { format: 'A' }));
      } else {
        // Check for duplicate writers
        const existingWriter = outputWriters.get(normalizedOutput);
        if (existingWriter) {
          errors.push(Errors.duplicateOutput(normalizedOutput, ruleId, existingWriter, { format: 'A' }));
        } else {
          outputWriters.set(normalizedOutput, ruleId);
          parameters[normalizedOutput].source = 'derived';
        }
        normalizedOutputs.push(normalizedOutput);
      }
    }

    if (normalizedOutputs.length === 0) {
      errors.push(Errors.ruleNoOutputs(ruleId, { format: 'A' }));
      continue;
    }

    rules[ruleId] = {
      id: ruleId,
      inputs: normalizedInputs,
      outputs: normalizedOutputs,
      logic: rule.logic || '',
    };
  }

  if (errors.length > 0) {
    return err(errors);
  }

  return ok({ parameters, rules });
}

