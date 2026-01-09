/**
 * Error Panel Component
 */

import type { NormalizationError } from '../types/errors';

interface ErrorPanelProps {
  errors: NormalizationError[];
  title?: string;
}

export function ErrorPanel({ errors, title = 'Errors' }: ErrorPanelProps) {
  if (errors.length === 0) return null;

  return (
    <div className="error-panel rounded-lg p-4 mt-2">
      <h4 className="text-sm font-semibold text-[var(--color-error)] mb-2">
        {title} ({errors.length})
      </h4>
      <ul className="space-y-2">
        {errors.map((error, index) => (
          <li key={index} className="text-xs">
            <span className="font-mono text-[var(--color-error)] opacity-70">
              [{error.errorType}]
            </span>
            <span className="text-[var(--color-text)] ml-2">
              {error.message}
            </span>
            {(error.location.ruleId || error.location.parameter) && (
              <span className="text-[var(--color-text-muted)] ml-2">
                {error.location.ruleId && `rule: ${error.location.ruleId}`}
                {error.location.ruleId && error.location.parameter && ', '}
                {error.location.parameter && `param: ${error.location.parameter}`}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

