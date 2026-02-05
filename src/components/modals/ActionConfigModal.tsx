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
import { ACTION_TYPES } from '@/types';

interface ActionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Record<string, any>) => void;
  initialConfig?: Record<string, any>;
}

export function ActionConfigModal({ isOpen, onClose, onSave, initialConfig }: ActionConfigModalProps) {
  const [config, setConfig] = useState({
    actionType: initialConfig?.actionType || 'webhook',
    // Webhook
    url: initialConfig?.url || '',
    method: initialConfig?.method || 'POST',
    headers: initialConfig?.headers || '{}',
    body: initialConfig?.body || '',
    // Email
    to: initialConfig?.to || '',
    subject: initialConfig?.subject || '',
    emailBody: initialConfig?.emailBody || '',
    // Delay
    delayMs: initialConfig?.delayMs || 5000,
    // Condition
    condition: initialConfig?.condition || '',
    // Transform
    transformCode: initialConfig?.transformCode || '// Transform input data\nreturn input;',
  });

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const selectedAction = ACTION_TYPES.find((a) => a.id === config.actionType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Action</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select
              value={config.actionType}
              onValueChange={(value) => setConfig({ ...config, actionType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedAction?.description}
            </p>
          </div>

          {config.actionType === 'webhook' && (
            <Tabs defaultValue="url" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="url">URL & Method</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    placeholder="https://api.example.com/webhook"
                    value={config.url}
                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select
                    value={config.method}
                    onValueChange={(value) => setConfig({ ...config, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="headers" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Headers (JSON)</Label>
                  <Textarea
                    placeholder='{"Content-Type": "application/json"}'
                    value={config.headers}
                    onChange={(e) => setConfig({ ...config, headers: e.target.value })}
                    rows={6}
                  />
                </div>
              </TabsContent>

              <TabsContent value="body" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Body</Label>
                  <Textarea
                    placeholder="Request body..."
                    value={config.body}
                    onChange={(e) => setConfig({ ...config, body: e.target.value })}
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {'{{variable}}'} syntax to insert data from previous nodes.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {config.actionType === 'send_email' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>To</Label>
                <Input
                  placeholder="recipient@example.com"
                  value={config.to}
                  onChange={(e) => setConfig({ ...config, to: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Email subject"
                  value={config.subject}
                  onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  placeholder="Email body..."
                  value={config.emailBody}
                  onChange={(e) => setConfig({ ...config, emailBody: e.target.value })}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{{variable}}'} syntax to insert data from previous nodes.
                </p>
              </div>
            </div>
          )}

          {config.actionType === 'delay' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Delay Duration: {config.delayMs >= 60000 
                  ? `${Math.round(config.delayMs / 60000)} minutes` 
                  : `${Math.round(config.delayMs / 1000)} seconds`}
                </Label>
                <Slider
                  value={[config.delayMs]}
                  onValueChange={([value]) => setConfig({ ...config, delayMs: value })}
                  min={1000}
                  max={300000}
                  step={1000}
                />
              </div>
            </div>
          )}

          {config.actionType === 'condition' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Condition Expression</Label>
                <Textarea
                  placeholder="input.value > 10"
                  value={config.condition}
                  onChange={(e) => setConfig({ ...config, condition: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Write a JavaScript expression that evaluates to true or false. 
                  Use 'input' to access data from previous nodes.
                </p>
              </div>
            </div>
          )}

          {config.actionType === 'transform' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Transform Function</Label>
                <Textarea
                  value={config.transformCode}
                  onChange={(e) => setConfig({ ...config, transformCode: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Write JavaScript code to transform the input data. 
                  The 'input' variable contains data from previous nodes. Return the transformed data.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
