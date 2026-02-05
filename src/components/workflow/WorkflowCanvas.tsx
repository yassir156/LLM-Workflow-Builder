import { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TriggerNode, LLMNode, ActionNode } from '@/components/nodes';
import type { NodeType, WorkflowNode, WorkflowEdge } from '@/types';
import { Button } from '@/components/ui/button';
import { Play, Save, Plus } from 'lucide-react';
import { LLMConfigModal, TriggerConfigModal, ActionConfigModal } from '@/components/modals';
import { useWorkflowStore } from '@/store/workflowStore';

const nodeTypes = {
  trigger: TriggerNode,
  llm: LLMNode,
  action: ActionNode,
};

interface WorkflowCanvasProps {
  workflowId: string;
}

function WorkflowCanvasContent({ workflowId }: WorkflowCanvasProps) {
  const workflow = useWorkflowStore((state) => state.getWorkflowById(workflowId));
  const updateWorkflow = useWorkflowStore((state) => state.updateWorkflow);
  const executeWorkflow = useWorkflowStore((state) => state.executeWorkflow);
  const isExecuting = useWorkflowStore((state) => state.isExecuting);
  
  const initialNodes = workflow?.nodes.map((n) => ({
    id: n.id,
    type: n.data.type,
    position: n.position,
    data: {
      ...n.data,
      onConfigure: handleConfigureNode,
      onDelete: handleDeleteNode,
    },
  })) || [];

  const initialEdges = workflow?.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
  })) || [];
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [configModal, setConfigModal] = useState<{
    isOpen: boolean;
    nodeId: string | null;
    nodeType: NodeType | null;
    config: Record<string, any>;
  }>({
    isOpen: false,
    nodeId: null,
    nodeType: null,
    config: {},
  });

  const { screenToFlowPosition } = useReactFlow();
  const nodeIdCounter = useRef(0);

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = {
        id: `e${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        label: undefined as string | undefined,
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  function handleConfigureNode(nodeId: string, config: Record<string, any>) {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setConfigModal({
        isOpen: true,
        nodeId,
        nodeType: node.type as NodeType,
        config,
      });
    }
  }

  function handleDeleteNode(nodeId: string) {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }

  function handleSaveConfig(config: Record<string, any>) {
    if (configModal.nodeId) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === configModal.nodeId
            ? { ...n, data: { ...n.data, config } }
            : n
        )
      );
    }
    setConfigModal({ isOpen: false, nodeId: null, nodeType: null, config: {} });
  }

  function addNode(type: NodeType, label: string) {
    nodeIdCounter.current += 1;
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: screenToFlowPosition({
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 50 + nodeIdCounter.current * 20,
      }),
      data: {
        label,
        type,
        config: {},
        onConfigure: handleConfigureNode,
        onDelete: handleDeleteNode,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }

  function handleSaveWorkflow() {
    const workflowNodes: WorkflowNode[] = nodes.map((n) => ({
      id: n.id,
      type: n.type as NodeType,
      position: n.position,
      data: {
        label: n.data.label,
        type: n.data.type,
        config: n.data.config,
      },
    }));

    const workflowEdges: WorkflowEdge[] = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
    }));

    updateWorkflow(workflowId, {
      nodes: workflowNodes,
      edges: workflowEdges,
    });
  }

  async function handleExecuteWorkflow() {
    await executeWorkflow(workflowId);
  }

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background className="bg-muted/20" />
        <Controls />
        <MiniMap className="bg-background border rounded-lg shadow-lg" />

        <Panel position="top-left" className="bg-background border rounded-lg shadow-lg p-4">
          <h3 className="font-semibold mb-3">Add Nodes</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('trigger', 'Manual Trigger')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Trigger
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('llm', 'LLM Node')}
            >
              <Plus className="w-4 h-4 mr-2" />
              LLM
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('action', 'Action')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Action
            </Button>
          </div>
        </Panel>

        <Panel position="top-right" className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveWorkflow}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            size="sm"
            onClick={handleExecuteWorkflow}
            disabled={isExecuting}
          >
            <Play className="w-4 h-4 mr-2" />
            {isExecuting ? 'Running...' : 'Run'}
          </Button>
        </Panel>
      </ReactFlow>

      {configModal.nodeType === 'llm' && (
        <LLMConfigModal
          isOpen={configModal.isOpen}
          onClose={() => setConfigModal({ isOpen: false, nodeId: null, nodeType: null, config: {} })}
          onSave={handleSaveConfig}
          initialConfig={configModal.config}
        />
      )}

      {configModal.nodeType === 'trigger' && (
        <TriggerConfigModal
          isOpen={configModal.isOpen}
          onClose={() => setConfigModal({ isOpen: false, nodeId: null, nodeType: null, config: {} })}
          onSave={handleSaveConfig}
          initialConfig={configModal.config}
        />
      )}

      {(configModal.nodeType === 'action' || configModal.nodeType === 'condition' || configModal.nodeType === 'delay') && (
        <ActionConfigModal
          isOpen={configModal.isOpen}
          onClose={() => setConfigModal({ isOpen: false, nodeId: null, nodeType: null, config: {} })}
          onSave={handleSaveConfig}
          initialConfig={configModal.config}
        />
      )}
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasContent {...props} />
    </ReactFlowProvider>
  );
}
