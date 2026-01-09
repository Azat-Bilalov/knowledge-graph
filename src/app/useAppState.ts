/**
 * Application State Hook
 * 
 * Manages the core application state including LLM inputs,
 * graph results, and rendering state.
 */

import { useState, useCallback } from 'react';
import type { FormatType, NormalizationError, CanonicalGraph } from '../shared/types';
import type { AgreementMetrics } from '../shared/types/diff';
import { normalize } from '../entities/normalization';
import { validateCanonicalGraph } from '../entities/validation';
import { visualize } from '../features/visualization';
import { computeAndRenderDiff } from '../features/diff';

// Initial example for Format A
const INITIAL_CONTENT = `{
  "parameters": {
    "systolic_pressure": { "type": "number", "description": "Systolic blood pressure in mmHg" },
    "diastolic_pressure": { "type": "number", "description": "Diastolic blood pressure in mmHg" },
    "hypertension": { "type": "boolean", "description": "Whether patient has hypertension" }
  },
  "rules": [
    {
      "id": "detect_hypertension",
      "inputs": ["systolic_pressure", "diastolic_pressure"],
      "outputs": ["hypertension"],
      "logic": "hypertension = systolic_pressure >= 140 || diastolic_pressure >= 90;"
    }
  ]
}`;

const INITIAL_CONTENT_2 = `{
  "parameters": {
    "systolic_pressure": { "type": "number" },
    "diastolic_pressure": { "type": "number" },
    "hypertension": { "type": "boolean" },
    "severe_hypertension": { "type": "boolean" }
  },
  "rules": [
    {
      "id": "detect_hypertension",
      "inputs": ["systolic_pressure", "diastolic_pressure"],
      "outputs": ["hypertension"],
      "logic": "hypertension = systolic_pressure >= 140 || diastolic_pressure >= 90;"
    },
    {
      "id": "detect_severe",
      "inputs": ["systolic_pressure"],
      "outputs": ["severe_hypertension"],
      "logic": "severe_hypertension = systolic_pressure >= 180;"
    }
  ]
}`;

export interface LLMInput {
  id: string;
  label: string;
  content: string;
  errors: NormalizationError[];
}

export interface GraphResult {
  id: string;
  label: string;
  svg: string | null;
  errors: NormalizationError[];
  isValid: boolean;
  graph: CanonicalGraph | null;
}

export interface DiffResultState {
  svg: string | null;
  metrics: AgreementMetrics | null;
  isAvailable: boolean;
}

export interface AppState {
  // Editor state
  inputs: LLMInput[];
  activeInputId: string;
  format: FormatType;
  
  // Visualization state
  graphs: GraphResult[];
  activeGraphTab: string;
  diffResult: DiffResultState;
  
  // UI state
  isRendering: boolean;
  isHelpOpen: boolean;
}

let inputCounter = 2;

function generateInputId(): string {
  return `llm_${++inputCounter}`;
}

export function useAppState() {
  const [state, setState] = useState<AppState>({
    inputs: [
      { id: 'llm_1', label: 'LLM 1', content: INITIAL_CONTENT, errors: [] },
      { id: 'llm_2', label: 'LLM 2', content: INITIAL_CONTENT_2, errors: [] },
    ],
    activeInputId: 'llm_1',
    format: 'A',
    graphs: [
      { id: 'llm_1', label: 'LLM 1', svg: null, errors: [], isValid: false, graph: null },
      { id: 'llm_2', label: 'LLM 2', svg: null, errors: [], isValid: false, graph: null },
    ],
    activeGraphTab: 'llm_1',
    diffResult: { svg: null, metrics: null, isAvailable: false },
    isRendering: false,
    isHelpOpen: false,
  });

  // Input management
  const updateInputContent = useCallback((id: string, content: string) => {
    setState(prev => ({
      ...prev,
      inputs: prev.inputs.map(input =>
        input.id === id ? { ...input, content, errors: [] } : input
      ),
    }));
  }, []);

  const setActiveInput = useCallback((id: string) => {
    setState(prev => ({ ...prev, activeInputId: id }));
  }, []);

  const setFormat = useCallback((format: FormatType) => {
    setState(prev => ({ ...prev, format }));
  }, []);

  const addInput = useCallback(() => {
    const newId = generateInputId();
    const newLabel = `LLM ${inputCounter}`;
    setState(prev => ({
      ...prev,
      inputs: [...prev.inputs, { id: newId, label: newLabel, content: '{}', errors: [] }],
      graphs: [...prev.graphs, { id: newId, label: newLabel, svg: null, errors: [], isValid: false, graph: null }],
      activeInputId: newId,
    }));
  }, []);

  const removeInput = useCallback((id: string) => {
    setState(prev => {
      const newInputs = prev.inputs.filter(i => i.id !== id);
      const newGraphs = prev.graphs.filter(g => g.id !== id);
      const newActiveInputId = prev.activeInputId === id
        ? newInputs[0]?.id || ''
        : prev.activeInputId;
      const newActiveGraphTab = prev.activeGraphTab === id
        ? newGraphs[0]?.id || 'diff'
        : prev.activeGraphTab;
      
      return {
        ...prev,
        inputs: newInputs,
        graphs: newGraphs,
        activeInputId: newActiveInputId,
        activeGraphTab: newActiveGraphTab,
      };
    });
  }, []);

  // Graph tab management
  const setActiveGraphTab = useCallback((id: string) => {
    setState(prev => ({ ...prev, activeGraphTab: id }));
  }, []);

  // Rendering
  const renderGraphs = useCallback(async () => {
    setState(prev => ({ ...prev, isRendering: true }));

    try {
      const { inputs, format } = state;
      const newGraphs: GraphResult[] = [];
      const validGraphs: Array<{ label: string; graph: CanonicalGraph }> = [];

      // Process each input
      for (const input of inputs) {
        const normalizeResult = normalize(input.content, format);

        if (!normalizeResult.success) {
          newGraphs.push({
            id: input.id,
            label: input.label,
            svg: null,
            errors: normalizeResult.errors,
            isValid: false,
            graph: null,
          });
          // Update input errors
          setState(prev => ({
            ...prev,
            inputs: prev.inputs.map(i =>
              i.id === input.id ? { ...i, errors: normalizeResult.errors } : i
            ),
          }));
          continue;
        }

        // Validate the graph
        const validateResult = validateCanonicalGraph(normalizeResult.value);
        if (!validateResult.success) {
          newGraphs.push({
            id: input.id,
            label: input.label,
            svg: null,
            errors: validateResult.errors,
            isValid: false,
            graph: null,
          });
          setState(prev => ({
            ...prev,
            inputs: prev.inputs.map(i =>
              i.id === input.id ? { ...i, errors: validateResult.errors } : i
            ),
          }));
          continue;
        }

        // Render the graph
        try {
          const renderResult = await visualize(validateResult.value);
          newGraphs.push({
            id: input.id,
            label: input.label,
            svg: renderResult.svg,
            errors: [],
            isValid: true,
            graph: validateResult.value,
          });
          validGraphs.push({ label: input.label, graph: validateResult.value });
          // Clear input errors
          setState(prev => ({
            ...prev,
            inputs: prev.inputs.map(i =>
              i.id === input.id ? { ...i, errors: [] } : i
            ),
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Rendering failed';
          newGraphs.push({
            id: input.id,
            label: input.label,
            svg: null,
            errors: [{ errorType: 'VALIDATION_ERROR', message: errorMessage, location: {} }],
            isValid: false,
            graph: null,
          });
        }
      }

      // Compute diff if we have at least 2 valid graphs
      let diffResult: DiffResultState = { svg: null, metrics: null, isAvailable: false };
      
      if (validGraphs.length >= 2) {
        try {
          const { diff, rendered } = await computeAndRenderDiff(validGraphs);
          diffResult = {
            svg: rendered.svg,
            metrics: diff.metrics,
            isAvailable: true,
          };
        } catch (error) {
          console.error('Diff computation failed:', error);
          diffResult = { svg: null, metrics: null, isAvailable: false };
        }
      }

      setState(prev => ({
        ...prev,
        graphs: newGraphs,
        diffResult,
        isRendering: false,
      }));
    } catch (error) {
      console.error('Rendering failed:', error);
      setState(prev => ({ ...prev, isRendering: false }));
    }
  }, [state]);

  // Help modal
  const openHelp = useCallback(() => {
    setState(prev => ({ ...prev, isHelpOpen: true }));
  }, []);

  const closeHelp = useCallback(() => {
    setState(prev => ({ ...prev, isHelpOpen: false }));
  }, []);

  return {
    state,
    actions: {
      updateInputContent,
      setActiveInput,
      setFormat,
      addInput,
      removeInput,
      setActiveGraphTab,
      renderGraphs,
      openHelp,
      closeHelp,
    },
  };
}

