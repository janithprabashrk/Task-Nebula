import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: number; role: 'admin'|'member'; email: string; name: string };
  }
}
