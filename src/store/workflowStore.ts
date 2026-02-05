import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workflow, WorkflowNode, WorkflowEdge, ExecutionLog, LogEntry } from '@/types';

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  executionLogs: ExecutionLog[];
  isExecuting: boolean;
  
  // Workflow CRUD
  createWorkflow: (name: string, description: string, userId: string) => Workflow;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  getWorkflowById: (id: string) => Workflow | undefined;
  
  // Node operations
  addNode: (workflowId: string, node: WorkflowNode) => void;
  updateNode: (workflowId: string, nodeId: string, updates: Partial<WorkflowNode>) => void;
  removeNode: (workflowId: string, nodeId: string) => void;
  
  // Edge operations
  addEdge: (workflowId: string, edge: WorkflowEdge) => void;
  removeEdge: (workflowId: string, edgeId: string) => void;
  
  // Execution
  executeWorkflow: (workflowId: string, inputData?: any) => Promise<ExecutionLog>;
  getExecutionLogs: (workflowId: string) => ExecutionLog[];
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflows: [],
      currentWorkflow: null,
      executionLogs: [],
      isExecuting: false,

      createWorkflow: (name, description, userId) => {
        const newWorkflow: Workflow = {
          id: crypto.randomUUID(),
          name,
          description,
          nodes: [],
          edges: [],
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId,
        };
        
        set((state) => ({
          workflows: [...state.workflows, newWorkflow],
          currentWorkflow: newWorkflow,
        }));
        
        return newWorkflow;
      },

      updateWorkflow: (id, updates) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
          ),
          currentWorkflow: state.currentWorkflow?.id === id 
            ? { ...state.currentWorkflow, ...updates, updatedAt: new Date().toISOString() }
            : state.currentWorkflow,
        }));
      },

      deleteWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
          currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
        }));
      },

      setCurrentWorkflow: (workflow) => {
        set({ currentWorkflow: workflow });
      },

      getWorkflowById: (id) => {
        return get().workflows.find((w) => w.id === id);
      },

      addNode: (workflowId, node) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? { ...w, nodes: [...w.nodes, node], updatedAt: new Date().toISOString() }
              : w
          ),
          currentWorkflow: state.currentWorkflow?.id === workflowId
            ? { ...state.currentWorkflow, nodes: [...state.currentWorkflow.nodes, node] }
            : state.currentWorkflow,
        }));
      },

      updateNode: (workflowId, nodeId, updates) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  nodes: w.nodes.map((n) =>
                    n.id === nodeId ? { ...n, ...updates } : n
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : w
          ),
        }));
      },

      removeNode: (workflowId, nodeId) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  nodes: w.nodes.filter((n) => n.id !== nodeId),
                  edges: w.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
                  updatedAt: new Date().toISOString(),
                }
              : w
          ),
        }));
      },

      addEdge: (workflowId, edge) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? { ...w, edges: [...w.edges, edge], updatedAt: new Date().toISOString() }
              : w
          ),
        }));
      },

      removeEdge: (workflowId, edgeId) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  edges: w.edges.filter((e) => e.id !== edgeId),
                  updatedAt: new Date().toISOString(),
                }
              : w
          ),
        }));
      },

      executeWorkflow: async (workflowId, inputData = {}) => {
        const workflow = get().getWorkflowById(workflowId);
        if (!workflow) throw new Error('Workflow not found');

        const executionLog: ExecutionLog = {
          id: crypto.randomUUID(),
          workflowId,
          status: 'running',
          startedAt: new Date().toISOString(),
          logs: [],
        };

        set((state) => ({
          executionLogs: [...state.executionLogs, executionLog],
          isExecuting: true,
        }));

        const addLog = (nodeId: string, message: string, type: LogEntry['type'] = 'info') => {
          const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            nodeId,
            message,
            type,
          };
          executionLog.logs.push(entry);
        };

        try {
          // Find trigger nodes
          const triggerNodes = workflow.nodes.filter((n) => n.data.type === 'trigger');
          
          if (triggerNodes.length === 0) {
            throw new Error('No trigger node found in workflow');
          }

          // Execute starting from trigger nodes
          for (const triggerNode of triggerNodes) {
            await executeNode(triggerNode, workflow, inputData, addLog);
          }

          executionLog.status = 'completed';
          executionLog.completedAt = new Date().toISOString();
        } catch (error) {
          executionLog.status = 'failed';
          executionLog.completedAt = new Date().toISOString();
          addLog('system', `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }

        set((state) => ({
          executionLogs: state.executionLogs.map((log) =>
            log.id === executionLog.id ? executionLog : log
          ),
          isExecuting: false,
        }));

        return executionLog;
      },

      getExecutionLogs: (workflowId) => {
        return get().executionLogs.filter((log) => log.workflowId === workflowId);
      },
    }),
    {
      name: 'flowmind_workflows',
      partialize: (state) => ({ workflows: state.workflows, executionLogs: state.executionLogs }),
    }
  )
);

// Helper function to execute a node and its children
async function executeNode(
  node: WorkflowNode,
  workflow: Workflow,
  inputData: any,
  addLog: (nodeId: string, message: string, type?: LogEntry['type']) => void
): Promise<any> {
  addLog(node.id, `Executing ${node.data.type} node: ${node.data.label}`);
  
  let outputData = inputData;

  try {
    switch (node.data.type) {
      case 'trigger':
        addLog(node.id, 'Trigger activated', 'success');
        break;

      case 'llm':
        const llmConfig = node.data.config;
        addLog(node.id, `Calling LLM: ${llmConfig.provider} - ${llmConfig.model}`);
        
        // Simulate LLM call (in real implementation, this would call the actual API)
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        outputData = {
          ...inputData,
          llmResponse: `[Simulated response from ${llmConfig.model}]`,
        };
        addLog(node.id, 'LLM response received', 'success');
        break;

      case 'action':
        const actionType = node.data.config.actionType;
        addLog(node.id, `Executing action: ${actionType}`);
        
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        outputData = {
          ...inputData,
          actionResult: `Action ${actionType} completed`,
        };
        addLog(node.id, 'Action completed', 'success');
        break;

      case 'delay':
        const delayMs = node.data.config.delayMs || 1000;
        addLog(node.id, `Waiting for ${delayMs}ms`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        addLog(node.id, 'Delay completed', 'success');
        break;

      case 'condition':
        const condition = node.data.config.condition;
        addLog(node.id, `Evaluating condition: ${condition}`);
        // Simple condition evaluation (in real implementation, use a proper expression evaluator)
        const conditionResult = true; // Placeholder
        addLog(node.id, `Condition result: ${conditionResult}`, 'success');
        outputData = { ...inputData, conditionResult };
        break;

      default:
        addLog(node.id, `Unknown node type: ${node.data.type}`, 'error');
    }

    // Find and execute child nodes
    const outgoingEdges = workflow.edges.filter((e) => e.source === node.id);
    for (const edge of outgoingEdges) {
      const targetNode = workflow.nodes.find((n) => n.id === edge.target);
      if (targetNode) {
        await executeNode(targetNode, workflow, outputData, addLog);
      }
    }

    return outputData;
  } catch (error) {
    addLog(node.id, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    throw error;
  }
}
