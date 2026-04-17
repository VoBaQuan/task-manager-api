import { Router } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';

// ===== PHASE 1: Task Routes =====
// Router quản lý các endpoints liên quan đến Task

const router = Router();

// RESTful API convention:
// GET    /api/tasks        → lấy danh sách
// POST   /api/tasks        → tạo mới
// GET    /api/tasks/:id    → lấy chi tiết
// PUT    /api/tasks/:id    → cập nhật toàn bộ
// DELETE /api/tasks/:id    → xóa

router.route('/').get(getAllTasks).post(createTask);

router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);

export default router;
