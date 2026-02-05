import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Brain } from 'lucide-react';
import type { NodeData } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings2, Trash2, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const providerColors: Record<string, string> = {
  openrouter: 'bg-violet-500',
  gemini: 'bg-blue-500',
  huggingface: 'bg-yellow-500',
};

const providerNames: Record<string, string> = {
  openrouter: 'OpenRouter',
  gemini: 'Gemini',
  huggingface: 'Hugging Face',
};

function LLMNodeComponent({ id, data, selected }: NodeProps & { data: NodeData }) {
  const provider = data.config.provider || 'openrouter';
  const hasApiKey = !!data.config.apiKey;
  const colorClass = providerColors[provider] || 'bg-gray-500';

  return (
    <Card className={`min-w-[240px] p-4 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center`}>
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{data.label}</p>
          <p className="text-xs text-muted-foreground">{providerNames[provider]}</p>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {data.config.model && (
          <Badge variant="secondary" className="text-xs truncate max-w-full">
            {data.config.model.split('/').pop()}
          </Badge>
        )}
        
        {!hasApiKey && (
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <Key className="w-3 h-3" />
            <span>API key required</span>
          </div>
        )}

        {data.config.prompt && (
          <div className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 line-clamp-2">
            {data.config.prompt}
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

export const LLMNode = memo(LLMNodeComponent);
