import { useMemo, useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Play, Clock, CheckCircle2, Search, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';
import {
  filterAndSortWorkflows,
  getWorkflowStats,
  type WorkflowSort,
  type WorkflowStatusFilter,
} from '@/lib/workflowUtils';

interface WorkflowListProps {
  onSelectWorkflow: (id: string) => void;
}

export function WorkflowList({ onSelectWorkflow }: WorkflowListProps) {
  const workflows = useWorkflowStore((state) => state.workflows);
  const createWorkflow = useWorkflowStore((state) => state.createWorkflow);
  const deleteWorkflow = useWorkflowStore((state) => state.deleteWorkflow);
  const user = useAuthStore((state) => state.user);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkflowStatusFilter>('all');
  const [sortBy, setSortBy] = useState<WorkflowSort>('updated');

  const handleCreateWorkflow = () => {
    if (user && newWorkflow.name.trim()) {
      const workflow = createWorkflow(newWorkflow.name, newWorkflow.description, user.id);
      setIsCreateDialogOpen(false);
      setNewWorkflow({ name: '', description: '' });
      onSelectWorkflow(workflow.id);
    }
  };

  const userWorkflows = useMemo(
    () => workflows.filter((w) => w.userId === user?.id),
    [workflows, user?.id]
  );
  const workflowStats = useMemo(() => getWorkflowStats(userWorkflows), [userWorkflows]);
  const filteredWorkflows = useMemo(
    () =>
      filterAndSortWorkflows(userWorkflows, {
        query: searchTerm,
        status: statusFilter,
        sortBy,
      }),
    [userWorkflows, searchTerm, statusFilter, sortBy]
  );
  const hasActiveFilters = searchTerm.trim().length > 0 || statusFilter !== 'all';
  const showFilteredEmptyState = userWorkflows.length > 0 && filteredWorkflows.length === 0;

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Workflows</h1>
            <p className="text-muted-foreground mt-1">
              Create, track, and optimize your automation workflows
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Total workflows</p>
              <p className="text-2xl font-semibold mt-2">{workflowStats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated {workflowStats.lastUpdatedAt ? formatDistanceToNow(new Date(workflowStats.lastUpdatedAt)) : '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold mt-2">{workflowStats.active}</p>
              <p className="text-xs text-muted-foreground mt-1">Ready to run</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Drafts</p>
              <p className="text-2xl font-semibold mt-2">{workflowStats.draft}</p>
              <p className="text-xs text-muted-foreground mt-1">Still in progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Nodes</p>
              <p className="text-2xl font-semibold mt-2">{workflowStats.nodes}</p>
              <p className="text-xs text-muted-foreground mt-1">Across all workflows</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search workflows by name or description"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as WorkflowStatusFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as WorkflowSort)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Last updated</SelectItem>
                <SelectItem value="created">Newest created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="nodes">Most nodes</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredWorkflows.length}</span> of{' '}
            <span className="font-medium text-foreground">{userWorkflows.length}</span> workflows
          </div>
        </div>
      </div>

      {userWorkflows.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first workflow to start automating with AI
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      ) : showFilteredEmptyState ? (
        <Card className="text-center py-14">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No workflows match your filters</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search or status filter to see more results.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <span>Suggestions:</span>
              <ul className="space-y-1">
                <li>• Use shorter keywords like “email” or “report”</li>
                <li>• Switch to “All statuses”</li>
                <li>• Sort by “Last updated” to find recent work</li>
              </ul>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Reset filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{workflow.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {workflow.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Badge variant={workflow.isActive ? 'default' : 'secondary'} className="ml-2">
                    {workflow.isActive ? 'Active' : 'Draft'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{workflow.nodes.length} nodes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(workflow.updatedAt))}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onSelectWorkflow(workflow.id)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onSelectWorkflow(workflow.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteWorkflow(workflow.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="My Workflow"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What does this workflow do?"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={!newWorkflow.name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
