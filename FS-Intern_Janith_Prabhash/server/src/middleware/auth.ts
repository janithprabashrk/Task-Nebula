import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtUser } from '../types';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Missing Authorization header' });
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Invalid Authorization header' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtUser;
    (req as any).user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(role: 'admin' | 'member') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtUser | undefined;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
