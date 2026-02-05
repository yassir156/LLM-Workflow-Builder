import type { Workflow } from '../types';

export type WorkflowStatusFilter = 'all' | 'active' | 'draft';
export type WorkflowSort = 'updated' | 'created' | 'name' | 'nodes';

interface WorkflowFilterOptions {
  query: string;
  status: WorkflowStatusFilter;
  sortBy: WorkflowSort;
}

const byDateDesc = (left: string, right: string) =>
  new Date(right).getTime() - new Date(left).getTime();

export function filterAndSortWorkflows(
  workflows: Workflow[],
  { query, status, sortBy }: WorkflowFilterOptions
): Workflow[] {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = workflows.filter((workflow) => {
    const matchesQuery =
      !normalizedQuery ||
      workflow.name.toLowerCase().includes(normalizedQuery) ||
      workflow.description.toLowerCase().includes(normalizedQuery);

    const matchesStatus =
      status === 'all' ||
      (status === 'active' && workflow.isActive) ||
      (status === 'draft' && !workflow.isActive);

    return matchesQuery && matchesStatus;
  });

  const sorted = [...filtered];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return byDateDesc(a.createdAt, b.createdAt);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'nodes':
        return b.nodes.length - a.nodes.length;
      case 'updated':
      default:
        return byDateDesc(a.updatedAt, b.updatedAt);
    }
  });

  return sorted;
}

export function getWorkflowStats(workflows: Workflow[]) {
  const total = workflows.length;
  const active = workflows.filter((workflow) => workflow.isActive).length;
  const draft = total - active;
  const nodes = workflows.reduce((sum, workflow) => sum + workflow.nodes.length, 0);
  const lastUpdatedAt = workflows.reduce<string | null>((latest, workflow) => {
    if (!latest) {
      return workflow.updatedAt;
    }
    return new Date(workflow.updatedAt).getTime() > new Date(latest).getTime()
      ? workflow.updatedAt
      : latest;
  }, null);

  return {
    total,
    active,
    draft,
    nodes,
    lastUpdatedAt,
  };
}
