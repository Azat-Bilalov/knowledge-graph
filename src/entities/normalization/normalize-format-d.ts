/**
 * Format D Normalizer
 * 
 * Format D — Parameter-centric Rules
 * Knowledge is organized around parameters, each declaring how it's computed.
 */

import type { FormatD } from '../../shared/types/formats';
import type { CanonicalGraph, CanonicalParameter, CanonicalRule, ParameterType } from '../../shared/types/canonical';
import type { NormalizationError, Result } from '../../shared/types/errors';
import { ok, err, Errors } from '../../shared/types/errors';
import { normalizeId, isValidId } from '../../shared/lib/normalize-id';

/**
 * Validates and normalizes Format D input into canonical model
 */
export function normalizeFormatD(input: FormatD): Result<CanonicalGraph> {
  const errors: NormalizationError[] = [];
  const parameters: Record<string, CanonicalParameter> = {};
  const rules: Record<string, CanonicalRule> = {};
  const paramTypes: Map<string, ParameterType> = new Map();

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    errors.push(Errors.schemaMismatch('Format D must be an object mapping parameter names to definitions', { format: 'D' }));
    return err(errors);
  }

  // First pass: register all parameters
  for (const [rawId, paramDef] of Object.entries(input)) {
    const id = normalizeId(rawId);
    
    if (!isValidId(rawId)) {
      errors.push(Errors.emptyParameterName({ format: 'D', parameter: rawId }));
      continue;
    }

    if (!paramDef.type || !['number', 'boolean', 'string'].includes(paramDef.type)) {
      errors.push(Errors.missingType(id, { format: 'D' }));
      continue;
    }

    paramTypes.set(id, paramDef.type);

    // Determine source based on whether it has computed_by
    const hasComputation = Array.isArray(paramDef.computed_by) && paramDef.computed_by.length > 0;
    
    parameters[id] = {
      id,
      type: paramDef.type,
      description: paramDef.description,
      source: hasComputation ? 'derived' : 'input',
    };
  }

  // Second pass: extract rules from computed_by
  let ruleCounter = 0;
  
  for (const [rawId, paramDef] of Object.entries(input)) {
    const outputId = normalizeId(rawId);
    
    if (!parameters[outputId]) {
      continue; // Skip if parameter registration failed
    }

    if (!Array.isArray(paramDef.computed_by) || paramDef.computed_by.length === 0) {
      continue; // Input parameter, no rules to extract
    }

    // Each computed_by entry becomes a rule
    for (let i = 0; i < paramDef.computed_by.length; i++) {
      const computation = paramDef.computed_by[i];
      
      // Generate unique rule ID from output parameter
      const ruleId = paramDef.computed_by.length === 1
        ? `compute_${outputId}`
        : `compute_${outputId}_${i + 1}`;

      const normalizedInputs: string[] = [];

      // Validate input references
      for (const inputRef of computation.inputs || []) {
        const inputId = normalizeId(inputRef);
        if (!parameters[inputId]) {
          errors.push(Errors.undeclaredParameter(inputId, ruleId, { format: 'D', parameter: outputId }));
          continue;
        }
        normalizedInputs.push(inputId);
      }

      // Note: In Format D, multiple computed_by entries for same parameter are allowed
      // but we warn if the same parameter has multiple computation rules
      if (i > 0) {
        // This is additional computation for same parameter - allowed per spec
        // but creates potential ambiguity
      }

      rules[ruleId] = {
        id: ruleId,
        inputs: [...new Set(normalizedInputs)],
        outputs: [outputId],
        logic: computation.logic || '',
      };

      ruleCounter++;
    }
  }

  if (errors.length > 0) {
    return err(errors);
  }

  return ok({ parameters, rules });
}

