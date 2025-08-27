import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth';
import { createProjectSchema, createTaskSchema, validate } from '../validation';
import { requireAdmin } from '../rbac';

const router = Router();

// GET /projects?q=
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const q = (req.query.q as string | undefined)?.trim();
  const where = q ? { name: { contains: q, mode: 'insensitive' as const } } : {};
  // Members can see projects with tasks assigned to them; admins see all
  const user = (req as any).user as { id: number; role: 'admin' | 'member' };
  if (user.role === 'member') {
    const projects = await prisma.project.findMany({
      where: {
        AND: [
          where,
          { tasks: { some: { assigneeUserId: user.id } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(projects);
  }
  const projects = await prisma.project.findMany({ where, orderBy: { createdAt: 'desc' } });
  return res.json(projects);
});

// POST /projects (admin)
router.post('/', requireAuth, validate(createProjectSchema), async (req: Request, res: Response) => {
  const user = (req as any).user as { role: 'admin' | 'member' };
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, description } = req.body as { name?: string; description?: string };
  if (!name || !description) return res.status(400).json({ error: 'name and description required' });
  const project = await prisma.project.create({ data: { name, description } });
  return res.status(201).json(project);
});

// GET /projects/users (admin) — list users for assignment dropdown
router.get('/users', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
  res.json(users);
});

// GET /projects/:id/tasks?status=&assignee=
router.get('/:id/tasks', requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const status = req.query.status as string | undefined;
  const assignee = req.query.assignee ? Number(req.query.assignee) : undefined;

  const where: any = { projectId: id };
  if (status) where.status = status;
  if (assignee) where.assigneeUserId = assignee;

  // Members: ensure they have visibility to this project
  const user = (req as any).user as { id: number; role: 'admin' | 'member' };
  if (user.role === 'member') {
    const visible = await prisma.task.findFirst({ where: { projectId: id, assigneeUserId: user.id } });
    if (!visible) return res.status(403).json({ error: 'Forbidden' });
  }

  const tasks = await prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } });
  return res.json(tasks);
});

// POST /projects/:id/tasks (member/admin; default assignee=self)
router.post('/:id/tasks', requireAuth, validate(createTaskSchema), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { title, status, assigneeUserId, dueDate } = req.body as {
    title?: string; status?: 'todo'|'in_progress'|'done'; assigneeUserId?: number; dueDate?: string;
  };
  if (!title) return res.status(400).json({ error: 'title required' });

  const user = (req as any).user as { id: number; role: 'admin'|'member' };
  const assigneeId = user.role === 'admin' ? (assigneeUserId ?? user.id) : user.id;

  // Members can only create tasks within projects they are already assigned to
  if (user.role === 'member') {
    const hasAny = await prisma.task.findFirst({ where: { projectId: id, assigneeUserId: user.id } });
    if (!hasAny) return res.status(403).json({ error: 'Forbidden: not assigned to this project' });
  }

  const task = await prisma.task.create({
    data: {
      projectId: id,
      title,
      status: (status ?? 'todo') as any,
      assigneeUserId: assigneeId,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  return res.status(201).json(task);
});

export default router;
