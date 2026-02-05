// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

// Workflow Node Types
export type NodeType = 'trigger' | 'llm' | 'action' | 'condition' | 'delay' | 'webhook';

export interface NodeData {
  label: string;
  type: NodeType;
  config: Record<string, any>;
  onConfigure?: (id: string, config: Record<string, any>) => void;
  onDelete?: (id: string) => void;
}

// LLM Configuration
export interface LLMConfig {
  provider: 'openrouter' | 'gemini' | 'huggingface';
  model: string;
  apiKey: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
}

// Workflow Types
export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// Execution Types
export interface ExecutionLog {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  logs: LogEntry[];
}

export interface LogEntry {
  timestamp: string;
  nodeId: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

// Available Free LLM APIs
export const FREE_LLM_APIS = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access multiple LLMs through a single API. Free tier available.',
    models: [
      { id: 'meta-llama/llama-3.2-3b-instruct', name: 'Llama 3.2 3B (Free)' },
      { id: 'google/gemini-flash-1.5-8b', name: 'Gemini Flash 1.5 8B (Free)' },
      { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B (Free)' },
    ],
    requiresKey: true,
    keyUrl: 'https://openrouter.ai/keys',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google\'s AI model with generous free tier.',
    models: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B' },
    ],
    requiresKey: true,
    keyUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Community AI models with free inference API.',
    models: [
      { id: 'microsoft/DialoGPT-medium', name: 'DialoGPT Medium' },
      { id: 'facebook/blenderbot-400M-distill', name: 'BlenderBot 400M' },
      { id: 'gpt2', name: 'GPT-2' },
    ],
    requiresKey: true,
    keyUrl: 'https://huggingface.co/settings/tokens',
  },
];

// Action Types
export const ACTION_TYPES = [
  { id: 'send_email', name: 'Send Email', icon: 'Mail', description: 'Send an email notification' },
  { id: 'webhook', name: 'Webhook', icon: 'Webhook', description: 'Send HTTP request to external service' },
  { id: 'delay', name: 'Delay', icon: 'Clock', description: 'Wait for a specified time' },
  { id: 'condition', name: 'Condition', icon: 'GitBranch', description: 'Branch based on a condition' },
  { id: 'transform', name: 'Transform Data', icon: 'Transform', description: 'Transform data format' },
];

// Trigger Types
export const TRIGGER_TYPES = [
  { id: 'manual', name: 'Manual Trigger', icon: 'Play', description: 'Start workflow manually' },
  { id: 'schedule', name: 'Schedule', icon: 'Calendar', description: 'Run on a schedule' },
  { id: 'webhook', name: 'Webhook', icon: 'Webhook', description: 'Trigger via HTTP webhook' },
  { id: 'form', name: 'Form Submission', icon: 'FormInput', description: 'Trigger on form submission' },
];
