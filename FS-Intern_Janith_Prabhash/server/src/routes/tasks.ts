import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth';
import { updateTaskSchema, validate } from '../validation';

const router = Router();

// PATCH /tasks/:id — optimistic locking via If-Match or body.version
router.patch('/:id', requireAuth, validate(updateTaskSchema), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const ifMatch = req.headers['if-match'] as string | undefined;
  const { title, status, assigneeUserId, version } = req.body as {
    title?: string; status?: 'todo'|'in_progress'|'done'; assigneeUserId?: number; version?: number;
  };
  // Accept version from If-Match header (preferred) or body.version. Allow 0 as a valid version.
  let providedVersion: number | undefined;
  if (ifMatch !== undefined) {
    const n = Number(ifMatch);
    if (Number.isNaN(n)) {
      return res.status(400).json({ error: 'Invalid If-Match version' });
    }
    providedVersion = n;
  } else {
    providedVersion = version;
  }
  if (providedVersion === undefined) {
    return res.status(400).json({ error: 'Missing version (If-Match header or body.version)' });
  }

  const user = (req as any).user as { id: number; role: 'admin'|'member' };

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  // RBAC: members can edit only their own tasks
  if (user.role !== 'admin' && task.assigneeUserId !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (task.version !== providedVersion) {
    return res.status(409).json({ error: 'Version conflict', currentVersion: task.version });
  }

  const data: any = {};
  if (title !== undefined) data.title = title;
  if (status !== undefined) data.status = status;
  if (assigneeUserId !== undefined) {
    if (user.role !== 'admin') return res.status(403).json({ error: 'Only admin can reassign tasks' });
    data.assigneeUserId = assigneeUserId;
  }
  data.version = providedVersion + 1;

  const updated = await prisma.task.update({
    where: { id },
    data,
  });
  return res.json(updated);
});

// DELETE /tasks/:id — member can delete own tasks; admin can delete any
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = (req as any).user as { id: number; role: 'admin'|'member' };

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (user.role !== 'admin' && task.assigneeUserId !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await prisma.task.delete({ where: { id } });
  return res.status(204).send();
});

export default router;
