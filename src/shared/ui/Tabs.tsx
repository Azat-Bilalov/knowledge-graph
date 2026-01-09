/**
 * Tabs Component
 */

import { type ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onAddTab?: () => void;
  children?: ReactNode;
  canClose?: boolean;
  canAdd?: boolean;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  onTabClose,
  onAddTab,
  children,
  canClose = false,
  canAdd = false,
}: TabsProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              className={`
                relative px-4 py-2.5 text-sm font-medium transition-all duration-200
                flex items-center gap-2 whitespace-nowrap
                ${tab.disabled 
                  ? 'text-[var(--color-text-muted)] cursor-not-allowed opacity-50' 
                  : 'text-[var(--color-text)] hover:text-[var(--color-primary)] cursor-pointer'
                }
                ${activeTab === tab.id 
                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' 
                  : ''
                }
              `}
            >
              {tab.label}
              {canClose && tabs.length > 1 && !tab.disabled && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose?.(tab.id);
                  }}
                  className="ml-1 w-4 h-4 rounded-full flex items-center justify-center hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                >
                  ×
                </span>
              )}
            </button>
          ))}
        </div>
        {canAdd && (
          <button
            onClick={onAddTab}
            className="px-3 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
            title="Add LLM"
          >
            +
          </button>
        )}
      </div>
      
      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

