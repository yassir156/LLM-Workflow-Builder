import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { filterAndSortWorkflows, getWorkflowStats } from '../dist-tests/lib/workflowUtils.js';

const makeWorkflow = (overrides) => ({
  id: overrides.id ?? crypto.randomUUID(),
  name: overrides.name ?? 'Workflow',
  description: overrides.description ?? '',
  nodes: overrides.nodes ?? [],
  edges: overrides.edges ?? [],
  isActive: overrides.isActive ?? false,
  createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00Z').toISOString(),
  updatedAt: overrides.updatedAt ?? new Date('2024-01-02T00:00:00Z').toISOString(),
  userId: overrides.userId ?? 'user-1',
});

describe('filterAndSortWorkflows', () => {
  const workflows = [
    makeWorkflow({
      id: 'a',
      name: 'Email Digest',
      description: 'Send weekly report',
      isActive: true,
      nodes: [{ id: 'n1' }],
      updatedAt: '2024-03-10T08:00:00Z',
    }),
    makeWorkflow({
      id: 'b',
      name: 'Invoice Reminder',
      description: 'Follow up on invoices',
      isActive: false,
      nodes: [{ id: 'n1' }, { id: 'n2' }],
      updatedAt: '2024-03-12T08:00:00Z',
    }),
    makeWorkflow({
      id: 'c',
      name: 'Campaign Analysis',
      description: 'Analyze ad campaigns',
      isActive: false,
      nodes: [],
      updatedAt: '2024-03-11T08:00:00Z',
    }),
  ];

  it('filters by query and status', () => {
    const result = filterAndSortWorkflows(workflows, {
      query: 'email',
      status: 'active',
      sortBy: 'updated',
    });

    assert.equal(result.length, 1);
    assert.equal(result[0].id, 'a');
  });

  it('sorts by node count', () => {
    const result = filterAndSortWorkflows(workflows, {
      query: '',
      status: 'all',
      sortBy: 'nodes',
    });

    assert.deepEqual(
      result.map((workflow) => workflow.id),
      ['b', 'a', 'c']
    );
  });

  it('sorts by name', () => {
    const result = filterAndSortWorkflows(workflows, {
      query: '',
      status: 'all',
      sortBy: 'name',
    });

    assert.deepEqual(
      result.map((workflow) => workflow.id),
      ['c', 'a', 'b']
    );
  });
});

describe('getWorkflowStats', () => {
  it('computes totals, nodes, and last update', () => {
    const workflows = [
      makeWorkflow({
        id: 'a',
        isActive: true,
        nodes: [{ id: 'n1' }],
        updatedAt: '2024-03-10T08:00:00Z',
      }),
      makeWorkflow({
        id: 'b',
        isActive: false,
        nodes: [{ id: 'n1' }, { id: 'n2' }],
        updatedAt: '2024-03-12T08:00:00Z',
      }),
    ];

    const stats = getWorkflowStats(workflows);

    assert.equal(stats.total, 2);
    assert.equal(stats.active, 1);
    assert.equal(stats.draft, 1);
    assert.equal(stats.nodes, 3);
    assert.equal(stats.lastUpdatedAt, '2024-03-12T08:00:00Z');
  });
});
