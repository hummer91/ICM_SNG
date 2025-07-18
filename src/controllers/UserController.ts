import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserRequest, UpdateUserRequest, ApiResponse } from '../types/User';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      const response: ApiResponse = {
        success: true,
        data: users,
        message: 'Users retrieved successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'User ID is required' },
        });
        return;
      }

      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: { message: 'User not found' },
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User retrieved successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserRequest = req.body;
      const newUser = await this.userService.createUser(userData);

      const response: ApiResponse = {
        success: true,
        data: newUser,
        message: 'User created successfully',
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'User ID is required' },
        });
        return;
      }

      const userData: UpdateUserRequest = req.body;
      const updatedUser = await this.userService.updateUser(id, userData);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: { message: 'User not found' },
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'User ID is required' },
        });
        return;
      }

      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: { message: 'User not found' },
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
