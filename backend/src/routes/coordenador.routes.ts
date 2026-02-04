import { Router } from "express";
import { CoordenadorController } from "../controllers/coordenador.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();
const ctrl = new CoordenadorController();

// COORDENADOR: listas
router.get(
  "/coordenador/alunos",
  authenticate,
  authorize("COORDENADOR"),
  (req, res) => ctrl.alunos(req as any, res)
);

router.get(
  "/coordenador/tutores",
  authenticate,
  authorize("COORDENADOR"),
  (req, res) => ctrl.tutores(req as any, res)
);

router.get(
  "/coordenador/aulas",
  authenticate,
  authorize("COORDENADOR"),
  (req, res) => ctrl.aulas(req as any, res)
);

export default router;
