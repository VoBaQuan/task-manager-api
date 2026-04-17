import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AppError } from "../middleware/errorHandler";
import cloudinary from "../config/cloudinary";

// ===== PHASE 2: Auth Controllers =====

// Hàm tạo JWT token từ user ID
const signToken = (userId: string): string => {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET is not defined");

  const SEVEN_DAYS = 7 * 24 * 60 * 60; // 604800 giay
  return jwt.sign({ id: userId }, secret, { expiresIn: SEVEN_DAYS });
};

// POST /api/auth/register - Đăng ký tài khoản mới
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    // Kiểm tra các field bắt buộc
    if (!name) {
      return next(new AppError("Please provide name", 400));
    }
    if (!email) {
      return next(new AppError("Please provide email", 400));
    }
    if (!password) {
      return next(new AppError("Please provide password", 400));
    }

    // Tạo user mới - password sẽ được hash tự động bởi pre-save hook
    const user = await User.create({ name, email, password });

    // Tạo token ngay sau khi đăng ký
    const token = signToken(user.id as string);

    // Trả về user info (không có password vì select: false trong schema)
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error); // Chuyển lỗi sang errorHandler middleware
  }
};

// POST /api/auth/login - Đăng nhập
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // Tìm user theo email, dùng .select('+password') để lấy password
    // (vì trong schema password có select: false)
    const user = await User.findOne({ email }).select("+password");

    // Không tìm thấy user HOẶC password sai
    // Gộp 2 case thành 1 message chung để tránh lộ thông tin
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Invalid email or password", 401));
    }

    const token = signToken(user.id as string);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me - Lấy thông tin user đang đăng nhập
// Route này được bảo vệ bởi protect middleware
// req.user đã được gắn sẵn từ protect middleware
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/me - Chỉnh sửa hồ sơ cá nhân
// Cho phép cập nhật: name, phone, address, gender, workPosition, companyName, companyAddress
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Chỉ lấy các field được phép cập nhật - email & password không được thay đổi ở đây
    const { name, phone, address, gender, workPosition, companyName, companyAddress } =
      req.body as {
        name?: string;
        phone?: string;
        address?: string;
        gender?: 'male' | 'female' | 'other';
        workPosition?: string;
        companyName?: string;
        companyAddress?: string;
      };

    // Xây dựng object chỉ chứa những field được gửi lên (không ghi đè field không gửi)
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData['name'] = name;
    if (phone !== undefined) updateData['phone'] = phone;
    if (address !== undefined) updateData['address'] = address;
    if (gender !== undefined) updateData['gender'] = gender;
    if (workPosition !== undefined) updateData['workPosition'] = workPosition;
    if (companyName !== undefined) updateData['companyName'] = companyName;
    if (companyAddress !== undefined) updateData['companyAddress'] = companyAddress;

    if (Object.keys(updateData).length === 0) {
      return next(new AppError('No valid fields provided to update', 400));
    }

    // findByIdAndUpdate với runValidators để chạy schema validation
    // new: true trả về document SAU khi update
    const updatedUser = await User.findByIdAndUpdate(
      req.user!._id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/auth/me/avatar - Upload ảnh đại diện
// Multer đã xử lý file trước khi vào đây, file nằm ở req.file
export const updateAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image file', 400));
    }

    // Xóa ảnh cũ trên Cloudinary nếu có
    const currentUser = await User.findById(req.user!._id);
    if (currentUser?.avatarPublicId) {
      await cloudinary.uploader.destroy(currentUser.avatarPublicId);
    }

    // req.file.path = secure URL, req.file.filename = public_id (từ multer-storage-cloudinary)
    const updatedUser = await User.findByIdAndUpdate(
      req.user!._id,
      { avatar: req.file.path, avatarPublicId: req.file.filename },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: { avatar: updatedUser!.avatar },
    });
  } catch (error) {
    next(error);
  }
};
