import { Router } from "express";
import { CoordenadorController } from "../controllers/coordenador.controller";

const router = Router();
const ctrl = new CoordenadorController();

router.get("/coordenador/alunos", (req, res) => ctrl.alunos(req as any, res));
router.get("/coordenador/tutores", (req, res) => ctrl.tutores(req as any, res));
router.get("/coordenador/aulas", (req, res) => ctrl.aulas(req as any, res));

export default router;
