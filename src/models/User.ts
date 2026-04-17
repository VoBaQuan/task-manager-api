import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// ===== PHASE 2: User Model =====

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  workPosition?: string;
  companyName?: string;
  companyAddress?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  // Method so sánh password - khai báo để TypeScript biết method này tồn tại
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,          // Không cho phép 2 user cùng email
      lowercase: true,       // Tự convert về chữ thường trước khi lưu
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'], // Regex validate email
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Mặc định KHÔNG trả password trong query (bảo mật)
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: 'Gender must be male, female, or other',
      },
    },
    workPosition: {
      type: String,
      trim: true,
      maxlength: [100, 'Work position cannot exceed 100 characters'],
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    companyAddress: {
      type: String,
      trim: true,
      maxlength: [200, 'Company address cannot exceed 200 characters'],
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ===== MIDDLEWARE CỦA MONGOOSE (Pre-save Hook) =====
// Chạy tự động TRƯỚC KHI lưu document vào DB
// Dùng function thường (không dùng arrow function) để có thể dùng 'this'
// Voi async hook trong Mongoose moi, khong can goi next()
// Chi can return - Mongoose tu xu ly Promise
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ===== INSTANCE METHOD =====
// Method gắn vào từng document (mỗi user object đều có method này)
UserSchema.methods['comparePassword'] = async function (
  candidatePassword: string
): Promise<boolean> {
  // bcrypt.compare so sánh plain text với hashed password
  // this.password là hashed password trong DB
  return bcrypt.compare(candidatePassword, this.password as string);
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
