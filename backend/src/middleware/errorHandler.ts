import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Zod validation errors (handles both instanceof and err.name === 'ZodError')
  if (err instanceof ZodError || err?.name === 'ZodError') {
    const formattedErrors: Record<string, string> = {};
    const issues = err.issues || err.errors || [];
    issues.forEach((issue: any) => {
      const field = issue.path?.join('.') || 'root';
      formattedErrors[field] = issue.message;
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please verify your submitted information.',
      errors: formattedErrors,
    });
  }

  // App-specific controlled errors
  if (err instanceof AppError || err?.statusCode) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }

  // File upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // Fallback internal error
  console.error('[Unhandled Exception]:', err);
  const safeMessage = err?.message && !err.message.includes('password') && !err.message.includes('postgres:') && !err.message.includes('secret')
    ? err.message
    : 'An unexpected error occurred while processing your request. Please try again.';
  return res.status(500).json({
    success: false,
    message: safeMessage,
  });
}
