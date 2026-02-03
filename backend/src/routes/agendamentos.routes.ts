import { Router } from 'express';
import { AgendamentosController } from '../controllers/agendamentos.controller';
import { authenticate } from '../middlewares/auth.middleware'; // ajuste o caminho

const router = Router();
const controller = new AgendamentosController();

//criar agendamento
router.post('/agendamentos', authenticate, (req, res) => controller.create(req as any, res));
router.get('/agendamentos/me', authenticate, (req, res) => controller.my(req as any, res));

//listar agendamentos do tutor
router.get('/agendamentos/mine', authenticate, (req, res) => controller.mineTutor(req as any, res));
router.put('/agendamentos/:id/confirm', authenticate, (req, res) => controller.confirm(req as any, res));
router.put('/agendamentos/:id/reject', authenticate, (req, res) => controller.reject(req as any, res));


export default router;
