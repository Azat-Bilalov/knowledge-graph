/**
 * Parameter ID Normalization
 * 
 * Normalizes parameter identifiers according to spec:
 * - trimmed
 * - lower_snake_case
 * - ASCII only
 */

/**
 * Normalizes a parameter ID to canonical form
 */
export function normalizeId(id: string): string {
  return id
    .trim()
    .toLowerCase()
    // Replace spaces and hyphens with underscores
    .replace(/[\s-]+/g, '_')
    // Remove non-ASCII characters
    .replace(/[^\x00-\x7F]/g, '')
    // Remove characters that aren't alphanumeric or underscores
    .replace(/[^a-z0-9_]/g, '')
    // Collapse multiple underscores
    .replace(/_+/g, '_')
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, '');
}

/**
 * Validates that an ID is not empty after normalization
 */
export function isValidId(id: string): boolean {
  const normalized = normalizeId(id);
  return normalized.length > 0;
}

