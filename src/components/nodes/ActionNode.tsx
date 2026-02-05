import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Mail, Webhook, Clock, GitBranch, ArrowRightLeft } from 'lucide-react';
import type { NodeData } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const actionIcons: Record<string, React.ElementType> = {
  send_email: Mail,
  webhook: Webhook,
  delay: Clock,
  condition: GitBranch,
  transform: ArrowRightLeft,
};

const actionColors: Record<string, string> = {
  send_email: 'bg-red-500',
  webhook: 'bg-indigo-500',
  delay: 'bg-amber-500',
  condition: 'bg-cyan-500',
  transform: 'bg-emerald-500',
};

const actionNames: Record<string, string> = {
  send_email: 'Send Email',
  webhook: 'Webhook',
  delay: 'Delay',
  condition: 'Condition',
  transform: 'Transform Data',
};

function ActionNodeComponent({ id, data, selected }: NodeProps & { data: NodeData }) {
  const actionType = data.config.actionType || 'webhook';
  const Icon = actionIcons[actionType] || Webhook;
  const colorClass = actionColors[actionType] || 'bg-gray-500';

  return (
    <Card className={`min-w-[200px] p-4 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{data.label}</p>
          <p className="text-xs text-muted-foreground">{actionNames[actionType]}</p>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {actionType === 'delay' && data.config.delayMs && (
          <Badge variant="secondary" className="text-xs">
            {data.config.delayMs >= 60000
              ? `${Math.round(data.config.delayMs / 60000)} min`
              : `${Math.round(data.config.delayMs / 1000)} sec`}
          </Badge>
        )}

        {actionType === 'webhook' && data.config.url && (
          <div className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 truncate">
            {data.config.url}
          </div>
        )}

        {actionType === 'send_email' && data.config.to && (
          <div className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 truncate">
            To: {data.config.to}
          </div>
        )}

        {actionType === 'condition' && data.config.condition && (
          <div className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 line-clamp-2">
            If: {data.config.condition}
          </div>
        )}
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => data.onConfigure?.(id, data.config)}
        >
          <Settings2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => data.onDelete?.(id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
    </Card>
  );
}

export const ActionNode = memo(ActionNodeComponent);
