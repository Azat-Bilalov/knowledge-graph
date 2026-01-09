/**
 * Editor Panel Component
 * 
 * Contains tabbed code editors for multiple LLM inputs.
 */

import { CodeEditor } from './CodeEditor';
import { Tabs, Select, ErrorPanel } from '../../shared/ui';
import type { FormatType, NormalizationError } from '../../shared/types';

interface LLMInput {
  id: string;
  label: string;
  content: string;
  errors: NormalizationError[];
}

interface EditorPanelProps {
  inputs: LLMInput[];
  activeInputId: string;
  format: FormatType;
  onInputChange: (id: string, content: string) => void;
  onActiveInputChange: (id: string) => void;
  onFormatChange: (format: FormatType) => void;
  onAddInput: () => void;
  onRemoveInput: (id: string) => void;
}

const FORMAT_OPTIONS = [
  { value: 'A', label: 'Format A — Rule-as-Function' },
  { value: 'B', label: 'Format B — Linear Pipeline' },
  { value: 'C', label: 'Format C — Atomic Blocks' },
  { value: 'D', label: 'Format D — Parameter-centric' },
];

export function EditorPanel({
  inputs,
  activeInputId,
  format,
  onInputChange,
  onActiveInputChange,
  onFormatChange,
  onAddInput,
  onRemoveInput,
}: EditorPanelProps) {
  const activeInput = inputs.find(i => i.id === activeInputId);
  const tabs = inputs.map(input => ({
    id: input.id,
    label: input.label,
  }));

  return (
    <div className="flex flex-col h-full bg-[var(--color-background)]">
      {/* Format selector */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <Select
          options={FORMAT_OPTIONS}
          value={format}
          onChange={(v) => onFormatChange(v as FormatType)}
          label="Input Format:"
        />
      </div>

      {/* Tabs and editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs
          tabs={tabs}
          activeTab={activeInputId}
          onTabChange={onActiveInputChange}
          onTabClose={onRemoveInput}
          onAddTab={onAddInput}
          canClose={inputs.length > 1}
          canAdd={true}
        >
          <div className="flex flex-col h-full p-4">
            {activeInput && (
              <>
                <div className="flex-1 min-h-0">
                  <CodeEditor
                    value={activeInput.content}
                    onChange={(content) => onInputChange(activeInput.id, content)}
                  />
                </div>
                <ErrorPanel errors={activeInput.errors} title="Normalization Errors" />
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}

