/**
 * Input Format Definitions
 * 
 * The system supports four input formats (A-D) for LLM-generated knowledge.
 * All formats are normalized into the canonical model.
 */

import type { ParameterType } from './canonical';

/** Supported input format identifiers */
export type FormatType = 'A' | 'B' | 'C' | 'D';

/**
 * Format A — Rule-as-Function Graph
 * 
 * The most expressive format with explicit parameter registry and rules.
 * Close to the canonical internal model.
 */
export interface FormatA {
  parameters: Record<string, {
    type: ParameterType;
    description?: string;
  }>;
  rules: Array<{
    id: string;
    inputs: string[];
    outputs: string[];
    logic: string;
  }>;
}

/**
 * Format B — Linear Rule Pipeline
 * 
 * Sequential pipeline where order defines execution order.
 * Inputs/outputs are inferred by static analysis of logic.
 */
export interface FormatB {
  parameters: Record<string, {
    type: ParameterType;
    description?: string;
  }>;
  pipeline: Array<{
    rule_id: string;
    logic: string;
  }>;
}

/**
 * Format C — Atomic Rule Blocks
 * 
 * Collection of independent, self-contained rules.
 * Each rule declares its own typed inputs and outputs.
 */
export type FormatC = Array<{
  rule_id: string;
  input_parameters: Array<{
    name: string;
    type: ParameterType;
  }>;
  output_parameters: Array<{
    name: string;
    type: ParameterType;
  }>;
  logic: string;
}>;

/**
 * Format D — Parameter-centric Rules
 * 
 * Knowledge organized around parameters.
 * Each parameter declares how it is computed.
 */
export type FormatD = Record<string, {
  type: ParameterType;
  description?: string;
  computed_by?: Array<{
    inputs: string[];
    logic: string;
  }>;
}>;

/** Union type for all supported input formats */
export type InputFormat = FormatA | FormatB | FormatC | FormatD;

/** Format display names for UI */
export const FORMAT_NAMES: Record<FormatType, string> = {
  A: 'Format A — Rule-as-Function Graph',
  B: 'Format B — Linear Rule Pipeline',
  C: 'Format C — Atomic Rule Blocks',
  D: 'Format D — Parameter-centric Rules',
};

