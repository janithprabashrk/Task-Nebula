import { Request, Response } from 'express';

let counters = {
  http_requests_total: 0,
};

export function metricsHandler(_req: Request, res: Response) {
  counters.http_requests_total += 1;
  res.type('text/plain').send(`http_requests_total ${counters.http_requests_total}`);
}
