/**
 * Main Application Component
 * 
 * Combines editor and visualization panels with global controls.
 */

import { useAppState } from './useAppState';
import { EditorPanel } from '../features/editor';
import { VisualizationPanel } from '../features/graph-viewer';
import { HelpModal } from '../features/help';
import { Button } from '../shared/ui';

export function App() {
  const { state, actions } = useAppState();

  return (
    <div className="h-screen flex flex-col bg-[var(--color-background)]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">
            <span className="text-[var(--color-primary)]">Knowledge</span>
            <span className="text-[var(--color-text)]">Graph</span>
            <span className="text-[var(--color-secondary)]">Diff</span>
          </h1>
          <span className="text-xs text-[var(--color-text-muted)] border border-[var(--color-border)] px-2 py-0.5 rounded">
            MVP
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={actions.renderGraphs}
            disabled={state.isRendering}
          >
            {state.isRendering ? (
              <>
                <span className="animate-spin">⟳</span>
                Rendering...
              </>
            ) : (
              <>
                <span>▶</span>
                Render Graphs
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={actions.openHelp}
            className="w-10 h-10 !p-0 text-lg"
            title="Help"
          >
            ?
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left panel - Editors */}
        <div className="w-1/2 border-r border-[var(--color-border)] flex flex-col">
          <EditorPanel
            inputs={state.inputs}
            activeInputId={state.activeInputId}
            format={state.format}
            onInputChange={actions.updateInputContent}
            onActiveInputChange={actions.setActiveInput}
            onFormatChange={actions.setFormat}
            onAddInput={actions.addInput}
            onRemoveInput={actions.removeInput}
          />
        </div>

        {/* Right panel - Visualization */}
        <div className="w-1/2 flex flex-col">
          <VisualizationPanel
            graphs={state.graphs}
            diffResult={state.diffResult}
            activeTab={state.activeGraphTab}
            onTabChange={actions.setActiveGraphTab}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-2 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>
            Medical Knowledge Graph Visualizer • Educational & Research Tool
          </span>
          <span>
            {state.inputs.length} LLM{state.inputs.length !== 1 ? 's' : ''} •
            {' '}Format {state.format} •
            {' '}{state.graphs.filter(g => g.isValid).length} valid graph{state.graphs.filter(g => g.isValid).length !== 1 ? 's' : ''}
          </span>
        </div>
      </footer>

      {/* Help Modal */}
      <HelpModal isOpen={state.isHelpOpen} onClose={actions.closeHelp} />
    </div>
  );
}

export default App;

