/**
 * Metrics Display Component
 * 
 * Shows agreement metrics for diff graph.
 */

import type { AgreementMetrics } from '../../shared/types/diff';

interface MetricsDisplayProps {
  metrics: AgreementMetrics;
}

export function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
        Agreement Metrics
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Parameters" data={metrics.parameters} />
        <MetricCard title="Rules" data={metrics.rules} />
        <MetricCard title="Edges" data={metrics.edges} />
      </div>
      <div className="mt-4 flex gap-4 text-xs">
        <Legend color="var(--color-success)" label="Common (all LLMs)" />
        <Legend color="var(--color-warning)" label="Partial (some LLMs)" />
        <Legend color="var(--color-error)" label="Unique (one LLM)" />
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  data: {
    total: number;
    common: number;
    partial: number;
    unique: number;
  };
}

function MetricCard({ title, data }: MetricCardProps) {
  return (
    <div className="text-center">
      <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
        {title}
      </div>
      <div className="text-2xl font-bold text-[var(--color-text)] mb-2">
        {data.total}
      </div>
      <div className="flex justify-center gap-3 text-xs">
        <span className="metric-common">{data.common}✓</span>
        <span className="metric-partial">{data.partial}◐</span>
        <span className="metric-unique">{data.unique}!</span>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-[var(--color-text-muted)]">{label}</span>
    </div>
  );
}

