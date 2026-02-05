import type { NodeType } from '../types';

export interface NodeLibraryItem {
  type: NodeType;
  label: string;
  description: string;
  config?: Record<string, any>;
}

export interface NodeLibraryGroup {
  title: string;
  items: NodeLibraryItem[];
}

export function getNodeLibrary(): NodeLibraryGroup[] {
  return [
    {
      title: 'Triggers',
      items: [
        {
          type: 'trigger',
          label: 'Manual Trigger',
          description: 'Start a workflow on demand.',
          config: { triggerType: 'manual' },
        },
        {
          type: 'trigger',
          label: 'Schedule Trigger',
          description: 'Run on a recurring schedule.',
          config: { triggerType: 'schedule', cronExpression: '0 9 * * 1' },
        },
        {
          type: 'trigger',
          label: 'Webhook Trigger',
          description: 'Start when a webhook is received.',
          config: { triggerType: 'webhook', webhookUrl: 'https://example.com/webhook' },
        },
        {
          type: 'trigger',
          label: 'Form Trigger',
          description: 'Launch when a form is submitted.',
          config: { triggerType: 'form' },
        },
      ],
    },
    {
      title: 'AI',
      items: [
        {
          type: 'llm',
          label: 'LLM Assistant',
          description: 'Generate or analyze with an LLM.',
        },
        {
          type: 'llm',
          label: 'Summarize Text',
          description: 'Create concise summaries.',
          config: { task: 'summarize' },
        },
      ],
    },
    {
      title: 'Logic',
      items: [
        {
          type: 'condition',
          label: 'Condition',
          description: 'Branch based on a rule.',
          config: { actionType: 'condition' },
        },
        {
          type: 'delay',
          label: 'Delay',
          description: 'Pause workflow execution.',
          config: { actionType: 'delay', delayMs: 30000 },
        },
      ],
    },
    {
      title: 'Actions',
      items: [
        {
          type: 'action',
          label: 'Send Email',
          description: 'Send a summary to an inbox.',
          config: { actionType: 'send_email' },
        },
        {
          type: 'action',
          label: 'Webhook',
          description: 'Call an external HTTP endpoint.',
          config: { actionType: 'webhook' },
        },
        {
          type: 'action',
          label: 'Transform Data',
          description: 'Map or enrich data payloads.',
          config: { actionType: 'transform' },
        },
      ],
    },
  ];
}

export function filterNodeLibrary(library: NodeLibraryGroup[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return library;
  }

  return library
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        `${item.label} ${item.description}`.toLowerCase().includes(normalizedQuery)
      ),
    }))
    .filter((group) => group.items.length > 0);
}
