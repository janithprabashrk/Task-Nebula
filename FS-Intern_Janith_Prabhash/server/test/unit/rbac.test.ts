import { describe, it, expect } from 'vitest';

function canEditTask(role: 'admin'|'member', taskAssigneeId: number, userId: number) {
  if (role === 'admin') return true;
  return taskAssigneeId === userId;
}

describe('RBAC helper', () => {
  it('admin can edit any task', () => {
    expect(canEditTask('admin', 2, 1)).toBe(true);
  });
  it('member can edit own task', () => {
    expect(canEditTask('member', 5, 5)).toBe(true);
  });
  it('member cannot edit others task', () => {
    expect(canEditTask('member', 7, 9)).toBe(false);
  });
});
