import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();
const controller = new UsersController();

// usuário logado
router.get('/me', authenticate, controller.me.bind(controller));

// ADMIN - gerenciar usuários
router.get('/', authenticate, authorize('ADMIN'), controller.list.bind(controller));
router.put('/:id/status', authenticate, authorize('ADMIN'), controller.setStatus.bind(controller));
router.put('/:id/role', authenticate, authorize('ADMIN'), controller.setRole.bind(controller));
router.delete('/:id', authenticate, authorize('ADMIN'), controller.delete.bind(controller));

export default router;
