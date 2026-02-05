import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Play, Calendar, Webhook, FormInput } from 'lucide-react';
import type { NodeData } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings2, Trash2 } from 'lucide-react';

const triggerIcons: Record<string, React.ElementType> = {
  manual: Play,
  schedule: Calendar,
  webhook: Webhook,
  form: FormInput,
};

const triggerColors: Record<string, string> = {
  manual: 'bg-green-500',
  schedule: 'bg-blue-500',
  webhook: 'bg-purple-500',
  form: 'bg-orange-500',
};

function TriggerNodeComponent({ id, data, selected }: NodeProps & { data: NodeData }) {
  const Icon = triggerIcons[data.config.triggerType] || Play;
  const colorClass = triggerColors[data.config.triggerType] || 'bg-gray-500';

  return (
    <Card className={`min-w-[200px] p-4 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{data.label}</p>
          <p className="text-xs text-muted-foreground capitalize">{data.config.triggerType} Trigger</p>
        </div>
      </div>

      {data.config.triggerType === 'schedule' && data.config.cronExpression && (
        <div className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 mb-2">
          {data.config.cronExpression}
        </div>
      )}

      {data.config.triggerType === 'webhook' && data.config.webhookUrl && (
        <div className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 mb-2 truncate">
          {data.config.webhookUrl}
        </div>
      )}

      <div className="flex gap-1 mt-2">
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

export const TriggerNode = memo(TriggerNodeComponent);
