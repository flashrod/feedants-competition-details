import type { NextFunction, Request, Response } from 'express';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // eslint-disable-next-line no-console
  console.error(err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  const status =
    typeof err === 'object' && err !== null && 'status' in err
      ? Number((err as { status: number }).status) || 500
      : 500;
  res.status(status).json({ error: { message, status } });
}

export function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}
