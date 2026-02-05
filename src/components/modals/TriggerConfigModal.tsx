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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TRIGGER_TYPES } from '@/types';

interface TriggerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Record<string, any>) => void;
  initialConfig?: Record<string, any>;
}

export function TriggerConfigModal({ isOpen, onClose, onSave, initialConfig }: TriggerConfigModalProps) {
  const [config, setConfig] = useState({
    triggerType: initialConfig?.triggerType || 'manual',
    cronExpression: initialConfig?.cronExpression || '0 9 * * *',
    webhookUrl: initialConfig?.webhookUrl || '',
    formFields: initialConfig?.formFields || [],
  });

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const selectedTrigger = TRIGGER_TYPES.find((t) => t.id === config.triggerType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configure Trigger</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Trigger Type</Label>
            <Select
              value={config.triggerType}
              onValueChange={(value) => setConfig({ ...config, triggerType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trigger type" />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedTrigger?.description}
            </p>
          </div>

          {config.triggerType === 'schedule' && (
            <div className="space-y-2">
              <Label>Cron Expression</Label>
              <Input
                value={config.cronExpression}
                onChange={(e) => setConfig({ ...config, cronExpression: e.target.value })}
                placeholder="0 9 * * *"
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Examples:</p>
                <ul className="list-disc list-inside">
                  <li><code>0 9 * * *</code> - Every day at 9:00 AM</li>
                  <li><code>0 */6 * * *</code> - Every 6 hours</li>
                  <li><code>0 0 * * 1</code> - Every Monday at midnight</li>
                </ul>
              </div>
            </div>
          )}

          {config.triggerType === 'webhook' && (
            <div className="space-y-2">
              <Label>Webhook URL (Auto-generated)</Label>
              <Input
                value={config.webhookUrl || `${window.location.origin}/api/webhook/${crypto.randomUUID()}`}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                Send a POST request to this URL to trigger the workflow.
              </p>
            </div>
          )}

          {config.triggerType === 'form' && (
            <div className="space-y-2">
              <Label>Form Configuration</Label>
              <p className="text-xs text-muted-foreground">
                A form will be generated for users to submit data. You can access form data in subsequent nodes.
              </p>
            </div>
          )}

          {config.triggerType === 'manual' && (
            <div className="space-y-2">
              <Label>Manual Trigger</Label>
              <p className="text-xs text-muted-foreground">
                This workflow can only be started manually from the dashboard.
              </p>
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
