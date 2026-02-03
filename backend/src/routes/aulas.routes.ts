import { Router } from 'express';
import { AulasController } from '../controllers/aulas.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();
const controller = new AulasController();

// ALUNO lista aulas disponíveis
router.get('/', authenticate, authorize('ALUNO', 'COORDENADOR', 'ADMIN', 'TUTOR'), controller.list.bind(controller));

// TUTOR - minhas aulas
router.get('/mine', authenticate, authorize('TUTOR'), controller.mine.bind(controller));

// TUTOR - CRUD
router.post('/', authenticate, authorize('TUTOR'), controller.create.bind(controller));
router.put('/:id', authenticate, authorize('TUTOR'), controller.update.bind(controller));
router.delete('/:id', authenticate, authorize('TUTOR'), controller.remove.bind(controller));

export default router;
