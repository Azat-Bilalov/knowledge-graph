/**
 * Help Modal Component
 *
 * Contains documentation for the application, formats, and usage.
 */

import { Modal } from "../../shared/ui";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Help & Documentation"
      size="xl"
    >
      <div className="space-y-8 text-sm">
        {/* Purpose */}
        <Section title="About This Application">
          <p className="text-[var(--color-text-muted)]">
            This tool visualizes and compares medical knowledge graphs generated
            by different Large Language Models (LLMs). It is designed for
            educational use, research experiments, and studying LLM agreement in
            knowledge extraction.
          </p>
          <p className="text-[var(--color-text-muted)] mt-2">
            The system normalizes different input formats into a canonical
            bipartite graph model where:
          </p>
          <ul className="list-disc list-inside text-[var(--color-text-muted)] mt-2 space-y-1">
            <li>
              <strong>Parameter nodes</strong> represent medical variables or
              derived facts
            </li>
            <li>
              <strong>Rule nodes</strong> represent deterministic
              transformations
            </li>
            <li>
              Edges connect parameters to rules (inputs) and rules to parameters
              (outputs)
            </li>
          </ul>
          <p className="text-[var(--color-text-muted)] mt-2">
            This application was created for educational and research purposes.
          </p>
        </Section>

        {/* How to Use */}
        <Section title="How to Use">
          <ol className="list-decimal list-inside text-[var(--color-text-muted)] space-y-2">
            <li>Select the input format (A, B, C, or D) from the dropdown</li>
            <li>Paste LLM-generated JSON into the editor tabs</li>
            <li>
              Add more LLM tabs using the "+" button to compare multiple outputs
            </li>
            <li>Click "Render Graphs" to visualize each graph</li>
            <li>
              View the "Diff Graph" tab to see agreements and disagreements
            </li>
          </ol>
        </Section>

        {/* Format A */}
        <FormatSection
          title="Format A — Rule-as-Function Graph"
          description="The most expressive format with explicit parameter registry and rules. Each rule declares its inputs, outputs, and logic."
          example={FORMAT_A_EXAMPLE}
          prompt={FORMAT_A_PROMPT}
        />

        {/* Format B */}
        <FormatSection
          title="Format B — Linear Rule Pipeline"
          description="Sequential pipeline where rules are executed top-to-bottom. Inputs and outputs are inferred from the logic through static analysis."
          example={FORMAT_B_EXAMPLE}
          prompt={FORMAT_B_PROMPT}
        />

        {/* Format C */}
        <FormatSection
          title="Format C — Atomic Rule Blocks"
          description="Collection of independent, self-contained rules. Each rule declares its own typed parameters. Best for chunked LLM outputs."
          example={FORMAT_C_EXAMPLE}
          prompt={FORMAT_C_PROMPT}
        />

        {/* Format D */}
        <FormatSection
          title="Format D — Parameter-centric Rules"
          description="Knowledge organized around parameters. Each parameter declares how it is computed. Prevents conflicting writes to parameters."
          example={FORMAT_D_EXAMPLE}
          prompt={FORMAT_D_PROMPT}
        />

        {/* Canonical Model */}
        <Section title="Canonical Model">
          <p className="text-[var(--color-text-muted)]">
            All formats are normalized into a canonical bipartite graph model:
          </p>
          <ul className="list-disc list-inside text-[var(--color-text-muted)] mt-2 space-y-1">
            <li>
              Graph is <strong>bipartite</strong>: only Parameter ↔ Rule
              connections
            </li>
            <li>
              Graph is <strong>acyclic</strong>: no circular dependencies
            </li>
            <li>
              All transformations are <strong>deterministic</strong>
            </li>
          </ul>
          <p className="text-[var(--color-text-muted)] mt-2">
            Parameters have three types:{" "}
            <code className="text-[var(--color-primary)]">number</code>,{" "}
            <code className="text-[var(--color-primary)]">boolean</code>,{" "}
            <code className="text-[var(--color-primary)]">string</code>
          </p>
        </Section>

        {/* Diff Graph Colors */}
        <Section title="Diff Graph Color Coding">
          <div className="space-y-3">
            <ColorLegend
              color="var(--color-success)"
              label="Common (Black)"
              description="Present in ALL compared LLM outputs"
            />
            <ColorLegend
              color="var(--color-warning)"
              label="Partial (Orange)"
              description="Present in SOME but not all LLM outputs"
            />
            <ColorLegend
              color="var(--color-error)"
              label="Unique (Red)"
              description="Present in only ONE LLM output"
            />
          </div>
          <p className="text-[var(--color-text-muted)] mt-4">
            Edge styles also indicate agreement:
            <span className="ml-2">solid = common</span>,
            <span className="ml-2">dashed = partial</span>,
            <span className="ml-2">bold = unique</span>
          </p>
        </Section>
      </div>

      <div className="flex justify-end">
        <p className="text-[var(--color-text-muted)] text-xs">
          Created by{" "}
          <a
            href="https://azat_bil.t.me"
            className="text-[var(--color-primary)]"
          >
            Azat Bilalov
          </a>
        </p>
      </div>
    </Modal>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3 border-b border-[var(--color-border)] pb-2">
        {title}
      </h3>
      {children}
    </section>
  );
}

function FormatSection({
  title,
  description,
  example,
  prompt,
}: {
  title: string;
  description: string;
  example: string;
  prompt: string;
}) {
  return (
    <Section title={title}>
      <p className="text-[var(--color-text-muted)] mb-4">{description}</p>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Example JSON
          </h4>
          <pre className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-3 overflow-x-auto text-xs">
            <code className="text-[var(--color-text)]">{example}</code>
          </pre>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Example LLM Prompt
          </h4>
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-3">
            <p className="text-[var(--color-text)] text-xs whitespace-pre-wrap">
              {prompt}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function ColorLegend({
  color,
  label,
  description,
}: {
  color: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div>
        <div className="font-medium text-[var(--color-text)]">{label}</div>
        <div className="text-[var(--color-text-muted)]">{description}</div>
      </div>
    </div>
  );
}

// Example JSON for each format
const FORMAT_A_EXAMPLE = `{
  "parameters": {
    "systolic_pressure": { "type": "number" },
    "diastolic_pressure": { "type": "number" },
    "hypertension": { "type": "boolean" }
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

const FORMAT_B_EXAMPLE = `{
  "parameters": {
    "age": { "type": "number" },
    "systolic_pressure": { "type": "number" },
    "age_risk": { "type": "boolean" },
    "pressure_risk": { "type": "boolean" },
    "high_risk": { "type": "boolean" }
  },
  "pipeline": [
    { "rule_id": "check_age", "logic": "age_risk = age > 65;" },
    { "rule_id": "check_pressure", "logic": "pressure_risk = systolic_pressure > 140;" },
    { "rule_id": "combine_risk", "logic": "high_risk = age_risk && pressure_risk;" }
  ]
}`;

const FORMAT_C_EXAMPLE = `[
  {
    "rule_id": "detect_hypertension",
    "input_parameters": [
      { "name": "systolic_pressure", "type": "number" },
      { "name": "diastolic_pressure", "type": "number" }
    ],
    "output_parameters": [
      { "name": "hypertension", "type": "boolean" }
    ],
    "logic": "hypertension = systolic_pressure >= 140 || diastolic_pressure >= 90;"
  }
]`;

const FORMAT_D_EXAMPLE = `{
  "systolic_pressure": { "type": "number" },
  "diastolic_pressure": { "type": "number" },
  "hypertension": {
    "type": "boolean",
    "computed_by": [
      {
        "inputs": ["systolic_pressure", "diastolic_pressure"],
        "logic": "return systolic_pressure >= 140 || diastolic_pressure >= 90;"
      }
    ]
  }
}`;

const FORMAT_A_PROMPT = `Generate a medical knowledge graph as JSON with the following structure:
- "parameters": an object where each key is a parameter name with "type" (number/boolean/string)
- "rules": an array of rules, each with "id", "inputs" array, "outputs" array, and "logic" string

Topic: Hypertension detection from blood pressure measurements.
Include parameters for systolic and diastolic pressure, and a rule to detect hypertension.`;

const FORMAT_B_PROMPT = `Generate a medical knowledge pipeline as JSON with:
- "parameters": declare all parameters with their types
- "pipeline": ordered array of rules with "rule_id" and "logic"

The logic should use simple JavaScript-like assignments.
Topic: Calculate cardiovascular risk from age, blood pressure, and cholesterol.`;

const FORMAT_C_PROMPT = `Generate independent medical knowledge rules as a JSON array.
Each rule object should have:
- "rule_id": unique identifier
- "input_parameters": array of {name, type}
- "output_parameters": array of {name, type}
- "logic": JavaScript-like expression

Topic: Diabetes risk assessment based on glucose levels and BMI.`;

const FORMAT_D_PROMPT = `Generate parameter-centric medical knowledge as JSON.
Each parameter is a key with:
- "type": number/boolean/string
- "computed_by" (optional): array of computation rules with "inputs" and "logic"

Input parameters have no computed_by, derived parameters do.
Topic: Kidney function assessment using eGFR calculation.`;
