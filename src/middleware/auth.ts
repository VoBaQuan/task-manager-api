import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AppError } from './errorHandler';

// ===== PHASE 2: Auth Middleware =====

// Mở rộng interface Request của Express để thêm field 'user'
// Mặc định Express không có req.user — ta phải tự khai báo thêm
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Interface mô tả payload bên trong JWT token
interface JwtPayload {
  id: string;
  iat: number; // issued at - thời điểm tạo token
  exp: number; // expiration - thời điểm hết hạn
}

// Middleware bảo vệ route - chỉ cho phép request có token hợp lệ
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Lấy token từ Authorization header
  // Client gửi: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided. Please login.', 401));
  }

  // Tách lấy token (bỏ "Bearer ")
  const token = authHeader.split(' ')[1];

  // Verify token - nếu sai hoặc hết hạn sẽ ném lỗi → nhảy vào errorHandler
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET is not defined');

  const decoded = jwt.verify(token, secret) as JwtPayload;

  // Tìm user từ id trong token
  // Đảm bảo user vẫn còn tồn tại (chưa bị xóa)
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('User no longer exists', 401));
  }

  // Gắn user vào request để các controller sau dùng được
  req.user = user;

  // next() = chuyển tiếp sang middleware/controller tiếp theo
  next();
};
