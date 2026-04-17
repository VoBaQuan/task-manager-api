import multer from 'multer';
import path from 'path';
import { AppError } from './errorHandler';
import { Request } from 'express';

// ===== MULTER CONFIG: Avatar Upload =====

// Cấu hình nơi lưu file và tên file
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/avatars'); // Thư mục lưu ảnh
  },
  filename: (_req, file, cb) => {
    // Tên file: avatar-<userId>-<timestamp>.<ext>
    // Dùng Date.now() để tránh trùng tên khi upload nhiều lần
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});

// Chỉ cho phép upload file ảnh
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Chấp nhận file
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed', 400));
  }
};

// Export middleware upload avatar
// limits.fileSize: tối đa 2MB
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('avatar'); // 'avatar' là tên field trong form-data
