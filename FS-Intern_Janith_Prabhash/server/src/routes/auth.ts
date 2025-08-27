import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { JwtUser } from '../types';
import { loginSchema, validate } from '../validation';

const router = Router();

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const payload: JwtUser = { id: user.id, role: user.role, email: user.email, name: user.name };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '2h' });
  return res.json({ token, user: payload });
});

export default router;
