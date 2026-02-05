import { useWorkflowStore } from '@/store/workflowStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, Play } from 'lucide-react';

interface ExecutionPanelProps {
  workflowId: string;
}

export function ExecutionPanel({ workflowId }: ExecutionPanelProps) {
  const logs = useWorkflowStore((state) => 
    state.executionLogs.filter((log) => log.workflowId === workflowId)
  );
  const isExecuting = useWorkflowStore((state) => state.isExecuting);

  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  return (
    <div className="w-80 border-l bg-muted/10 flex flex-col">
      <div className="p-4 border-b bg-background">
        <h3 className="font-semibold flex items-center gap-2">
          <Play className="w-4 h-4" />
          Execution Logs
        </h3>
      </div>

      <ScrollArea className="flex-1">
        {sortedLogs.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm">No executions yet</p>
            <p className="text-xs mt-1">Run your workflow to see logs</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {sortedLogs.map((log) => (
              <div key={log.id} className="bg-background rounded-lg p-3 border">
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant={
                      log.status === 'running' ? 'default' :
                      log.status === 'completed' ? 'secondary' : 'destructive'
                    }
                    className="text-xs"
                  >
                    {log.status === 'running' && (
                      <Clock className="w-3 h-3 mr-1 animate-spin" />
                    )}
                    {log.status === 'completed' && (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    )}
                    {log.status === 'failed' && (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {log.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.startedAt).toLocaleTimeString()}
                  </span>
                </div>

                {log.logs.length > 0 && (
                  <div className="space-y-1">
                    {log.logs.map((entry, idx) => (
                      <div 
                        key={idx} 
                        className={`text-xs p-1.5 rounded ${
                          entry.type === 'error' ? 'bg-red-50 text-red-700' :
                          entry.type === 'success' ? 'bg-green-50 text-green-700' :
                          'bg-muted'
                        }`}
                      >
                        <span className="text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="mx-1">•</span>
                        {entry.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {isExecuting && (
        <div className="p-4 border-t bg-background">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 animate-spin" />
            Workflow is running...
          </div>
        </div>
      )}
    </div>
  );
}
