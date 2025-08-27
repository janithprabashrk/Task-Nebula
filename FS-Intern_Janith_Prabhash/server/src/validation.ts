import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export const createTaskSchema = z.object({
  title: z.string().min(1),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  assigneeUserId: z.number().int().positive().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  assigneeUserId: z.number().int().positive().optional(),
  version: z.number().int().positive().optional(),
});

export function validate<T extends z.ZodTypeAny>(schema: T, source: 'body' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = source === 'body' ? req.body : req.query;
    const result = schema.safeParse(data);
    if (!result.success) {
      return res.status(400).json({ error: 'Validation error', details: result.error.flatten() });
    }
    if (source === 'body') req.body = result.data as any;
    else req.query = result.data as any;
    next();
  };
}
