import { Router } from 'express';
import { MateriasController } from '../controllers/materias.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();
const controller = new MateriasController();

// listar: qualquer logado
router.get('/', authenticate, controller.list.bind(controller));

// ADMIN gerencia
router.post('/', authenticate, authorize('ADMIN'), controller.create.bind(controller));
router.put('/:id', authenticate, authorize('ADMIN'), controller.update.bind(controller));
router.delete('/:id', authenticate, authorize('ADMIN'), controller.remove.bind(controller));

export default router;
