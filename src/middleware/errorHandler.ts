import { Request, Response, NextFunction } from 'express';

// ===== PHASE 2: Centralized Error Handler =====

// Custom Error class để mang thêm statusCode
// Extends Error built-in của JavaScript
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message); // Gọi constructor của Error
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

// Error Handler Middleware - Express nhận ra đây là error middleware
// vì có 4 tham số (err, req, res, next)
// Phải đặt CUỐI CÙNG trong app.ts sau tất cả routes
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction // Bắt buộc có next dù không dùng - Express cần 4 params
): void => {
  // Mặc định là 500 nếu không rõ loại lỗi
  let statusCode = 500;
  let message = 'Internal Server Error';

  // AppError: lỗi ta tự throw với statusCode rõ ràng
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Mongoose ValidationError: thiếu field bắt buộc, sai enum,...
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // Mongoose CastError: ID sai format
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // MongoDB duplicate key (email đã tồn tại)
  if ('code' in err && Number((err as Record<string, unknown>)['code']) === 11000) {
    statusCode = 400;
    message = 'Email already exists';
  }

  // JWT errors (sẽ dùng ở Phase 3)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Chỉ hiện stack trace khi dev để debug
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack }),
  });
};
