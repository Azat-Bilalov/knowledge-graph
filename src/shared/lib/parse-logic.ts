/**
 * Logic Static Analysis
 * 
 * Extracts variable references from JavaScript-like logic strings.
 * Used by Format B to infer inputs/outputs from logic.
 * 
 * NOTE: This performs simple static analysis, not full JavaScript parsing.
 * Rule logic is treated as opaque text - it is NEVER executed.
 */

// Common JavaScript keywords to exclude from variable detection
const JS_KEYWORDS = new Set([
  'true', 'false', 'null', 'undefined',
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'return', 'function', 'const', 'let', 'var', 'new', 'this',
  'typeof', 'instanceof', 'in', 'of',
  'try', 'catch', 'finally', 'throw',
  'class', 'extends', 'super', 'static',
  'import', 'export', 'default', 'from', 'as',
  'async', 'await', 'yield',
  'delete', 'void', 'debugger', 'with',
]);

// Common built-in objects/functions to exclude
const BUILTINS = new Set([
  'Math', 'Number', 'String', 'Boolean', 'Array', 'Object',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite',
  'console', 'JSON', 'Date',
]);

/**
 * Extracts all identifier references from logic string
 */
function extractIdentifiers(logic: string): string[] {
  // Remove string literals to avoid false positives
  const withoutStrings = logic
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
  
  // Match potential identifiers
  const identifierRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
  const matches: string[] = [];
  let match;
  
  while ((match = identifierRegex.exec(withoutStrings)) !== null) {
    const identifier = match[1];
    if (!JS_KEYWORDS.has(identifier) && !BUILTINS.has(identifier)) {
      matches.push(identifier);
    }
  }
  
  return [...new Set(matches)];
}

/**
 * Extracts variables that appear on the left-hand side of assignments
 */
export function extractOutputs(logic: string): string[] {
  const outputs: string[] = [];
  
  // Match simple assignment patterns: identifier = (but not ==, ===, !=, !==)
  const assignmentRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?<!=)=(?!=)/g;
  let match;
  
  // Remove string literals first
  const withoutStrings = logic
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
  
  while ((match = assignmentRegex.exec(withoutStrings)) !== null) {
    const identifier = match[1];
    if (!JS_KEYWORDS.has(identifier) && !BUILTINS.has(identifier)) {
      outputs.push(identifier);
    }
  }
  
  return [...new Set(outputs)];
}

/**
 * Extracts variables that appear on the right-hand side (inputs)
 */
export function extractInputs(logic: string, outputs: string[]): string[] {
  const outputSet = new Set(outputs);
  const allIdentifiers = extractIdentifiers(logic);
  
  // Inputs are identifiers that are not outputs
  return allIdentifiers.filter(id => !outputSet.has(id));
}

/**
 * Analyzes logic string and extracts both inputs and outputs
 */
export function analyzeLogic(logic: string): { inputs: string[]; outputs: string[] } {
  const outputs = extractOutputs(logic);
  const inputs = extractInputs(logic, outputs);
  
  return { inputs, outputs };
}

