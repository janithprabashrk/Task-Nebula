import { NextFunction, Request, Response } from 'express';
import { logger } from '../logger';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ msg: 'request:error', err: { message: err?.message, stack: err?.stack } });
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
}
