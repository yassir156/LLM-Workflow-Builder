import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { LLMConfig } from '@/types';
import { FREE_LLM_APIS } from '@/types';
import { llmService } from '@/services/llmService';
import { Check, AlertCircle, ExternalLink } from 'lucide-react';

interface LLMConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: LLMConfig) => void;
  initialConfig?: Partial<LLMConfig>;
}

export function LLMConfigModal({ isOpen, onClose, onSave, initialConfig }: LLMConfigModalProps) {
  const [config, setConfig] = useState<LLMConfig>({
    provider: initialConfig?.provider || 'openrouter',
    model: initialConfig?.model || '',
    apiKey: initialConfig?.apiKey || '',
    prompt: initialConfig?.prompt || '',
    temperature: initialConfig?.temperature ?? 0.7,
    maxTokens: initialConfig?.maxTokens || 1000,
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const selectedProvider = FREE_LLM_APIS.find((p) => p.id === config.provider);
  const availableModels = selectedProvider?.models || [];

  const handleProviderChange = (provider: string) => {
    setConfig({
      ...config,
      provider: provider as LLMConfig['provider'],
      model: '', // Reset model when provider changes
    });
  };

  const handleTestConnection = async () => {
    if (!config.apiKey) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Testing connection...');

    const result = await llmService.testConnection(config);
    setTestStatus(result.success ? 'success' : 'error');
    setTestMessage(result.message);
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure LLM Node</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>LLM Provider</Label>
              <Select value={config.provider} onValueChange={handleProviderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {FREE_LLM_APIS.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedProvider?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Model</Label>
              <Select
                value={config.model}
                onValueChange={(model) => setConfig({ ...config, model })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>API Key</Label>
                {selectedProvider?.requiresKey && (
                  <a
                    href={selectedProvider.keyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                  >
                    Get API Key <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <Input
                type="password"
                placeholder="Enter your API key"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
              >
                {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </Button>

              {testStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700">{testMessage}</AlertDescription>
                </Alert>
              )}

              {testStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{testMessage}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea
                placeholder="Enter instructions for the AI..."
                value={config.prompt}
                onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This prompt will be sent to the AI along with the input data.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Temperature: {config.temperature}</Label>
              <Slider
                value={[config.temperature]}
                onValueChange={([value]) => setConfig({ ...config, temperature: value })}
                min={0}
                max={2}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Lower values make the output more focused and deterministic. Higher values make it more creative.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Max Tokens: {config.maxTokens}</Label>
              <Slider
                value={[config.maxTokens]}
                onValueChange={([value]) => setConfig({ ...config, maxTokens: value })}
                min={100}
                max={4000}
                step={100}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of tokens to generate in the response.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!config.model || !config.apiKey}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
