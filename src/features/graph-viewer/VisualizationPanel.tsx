/**
 * Visualization Panel Component
 *
 * Contains tabbed graph visualizations for each LLM + diff view.
 */

import { Tabs } from "../../shared/ui";
import { GraphViewer } from "./GraphViewer";
import { MetricsDisplay } from "./MetricsDisplay";
import type { AgreementMetrics } from "../../shared/types/diff";
import type { NormalizationError } from "../../shared/types";

interface GraphResult {
  id: string;
  label: string;
  svg: string | null;
  errors: NormalizationError[];
  isValid: boolean;
}

interface DiffResult {
  svg: string | null;
  metrics: AgreementMetrics | null;
  isAvailable: boolean;
}

interface VisualizationPanelProps {
  graphs: GraphResult[];
  diffResult: DiffResult;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function VisualizationPanel({
  graphs,
  diffResult,
  activeTab,
  onTabChange,
}: VisualizationPanelProps) {
  // Build tabs: one per LLM + Diff tab
  const tabs = [
    ...graphs.map((g) => ({
      id: g.id,
      label: g.label,
      disabled: false,
    })),
    {
      id: "diff",
      label: "Diff Graph",
      disabled: !diffResult.isAvailable,
    },
  ];

  const activeGraph = graphs.find((g) => g.id === activeTab);
  const showDiff = activeTab === "diff";

  return (
    <div className="flex flex-col h-full bg-[var(--color-background)]">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange}>
        <div className="flex-1 p-4 overflow-hidden">
          {showDiff ? (
            <DiffView diffResult={diffResult} />
          ) : activeGraph ? (
            <GraphView graph={activeGraph} />
          ) : (
            <EmptyState message="Select a tab to view graph" />
          )}
        </div>
      </Tabs>
    </div>
  );
}

function GraphView({ graph }: { graph: GraphResult }) {
  // Show "Click Render" if no SVG and no errors (initial state)
  if (!graph.svg && graph.errors.length === 0) {
    return (
      <EmptyState message="Click 'Render Graphs' to generate visualization" />
    );
  }

  // Show errors only if there are actual errors
  if (graph.errors.length > 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="error-panel rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[var(--color-error)] mb-4">
            Graph Generation Failed
          </h3>
          <ul className="space-y-2">
            {graph.errors.map((error, index) => (
              <li key={index} className="text-sm">
                <span className="font-mono text-[var(--color-error)] opacity-70">
                  [{error.errorType}]
                </span>
                <span className="text-[var(--color-text)] ml-2">
                  {error.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (!graph.svg) {
    return (
      <EmptyState message="Click 'Render Graphs' to generate visualization" />
    );
  }

  return <GraphViewer svg={graph.svg} />;
}

function DiffView({ diffResult }: { diffResult: DiffResult }) {
  if (!diffResult.isAvailable) {
    return (
      <EmptyState message="Diff requires at least 2 valid graphs. Fix errors in LLM inputs and render again." />
    );
  }

  if (!diffResult.svg) {
    return (
      <EmptyState message="Click 'Render Graphs' to generate diff visualization" />
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {diffResult.metrics && <MetricsDisplay metrics={diffResult.metrics} />}
      <div className="flex-1 min-h-0">
        <GraphViewer svg={diffResult.svg} />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-[var(--color-text-muted)]">{message}</p>
      </div>
    </div>
  );
}
