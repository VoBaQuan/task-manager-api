import { Request, Response, NextFunction } from 'express';
import Task from '../models/Task';
import { AppError } from '../middleware/errorHandler';

// ===== PHASE 2: CRUD Controllers (voi Auth) =====

// GET /api/tasks
export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Chi lay tasks cua user dang dang nhap
    // req.user duoc gan boi protect middleware
    const tasks = await Task.find({ user: req.user!._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id
export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Tim theo id VA user - tranh user A xem task cua user B
    const task = await Task.findOne({
      _id: req.params['id'],
      user: req.user!._id,
    });

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error); // CastError se duoc errorHandler xu ly
  }
};

// POST /api/tasks
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, status, priority, dueDate } = req.body as {
      title: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string;
    };

    if (!title) {
      return next(new AppError('Title is required', 400));
    }

    // Gan user ID vao task khi tao
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      user: req.user!._id,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Tim task thuoc dung user truoc khi update
    const task = await Task.findOneAndUpdate(
      { _id: req.params['id'], user: req.user!._id },
      req.body as Record<string, unknown>,
      { new: true, runValidators: true }
    );

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params['id'],
      user: req.user!._id,
    });

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
