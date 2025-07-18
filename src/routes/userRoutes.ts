import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

// GET /api/users
router.get('/', userController.getUsers);

// GET /api/users/:id
router.get('/:id', userController.getUserById);

// POST /api/users
router.post('/', userController.createUser);

// PUT /api/users/:id
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id
router.delete('/:id', userController.deleteUser);

export default router;
