import { describe, it, expect } from 'vitest';

// Basic validation tests for task status values
const validStatuses = ['todo', 'in_progress', 'done'] as const;

describe('Task status validation', () => {
  it('accepts valid statuses', () => {
    for (const s of validStatuses) expect(validStatuses.includes(s)).toBe(true);
  });
  it('rejects invalid status', () => {
    expect(validStatuses.includes('bogus' as any)).toBe(false);
  });
});
