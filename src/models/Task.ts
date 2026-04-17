import mongoose, { Document, Schema } from 'mongoose';

// ===== PHASE 1 + 2: Task Model =====

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  type: 'task' | 'bug';
  dueDate?: Date;
  // Phase 2: Task thuộc về User nào
  // mongoose.Types.ObjectId = kiểu ID của MongoDB trong TypeScript
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Schema định nghĩa cấu trúc document trong MongoDB
const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],  // Validation + custom error message
      trim: true,                              // Tự động xóa khoảng trắng đầu/cuối
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],  // Chỉ cho phép 3 giá trị này
      default: 'todo',                         // Giá trị mặc định khi không truyền
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    type: {
      type: String,
      enum: ['task', 'bug'],
      default: 'task',
    },
    dueDate: {
      type: Date,
    },
    // Phase 2: ref tạo quan hệ giữa Task và User
    // Khi query có thể dùng .populate('user') để lấy full thông tin user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    versionKey: false, // Ẩn field __v khỏi response
  }
);

// Model = Schema + tên collection trong MongoDB
// MongoDB sẽ tạo collection tên "tasks" (số nhiều, chữ thường)
const Task = mongoose.model<ITask>('Task', TaskSchema);

export default Task;
