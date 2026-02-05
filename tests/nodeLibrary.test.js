import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { filterNodeLibrary, getNodeLibrary } from '../dist-tests/lib/nodeLibrary.js';

describe('node library', () => {
  it('returns grouped nodes with items', () => {
    const library = getNodeLibrary();
    assert.ok(library.length > 0);
    assert.ok(library.every((group) => group.items.length > 0));
  });

  it('filters by label and description', () => {
    const library = getNodeLibrary();
    const filtered = filterNodeLibrary(library, 'webhook');

    assert.ok(filtered.length > 0);
    assert.ok(
      filtered.some((group) => group.items.some((item) => item.label.includes('Webhook')))
    );
  });

  it('returns empty when no matches exist', () => {
    const library = getNodeLibrary();
    const filtered = filterNodeLibrary(library, 'does-not-exist');

    assert.equal(filtered.length, 0);
  });
});
