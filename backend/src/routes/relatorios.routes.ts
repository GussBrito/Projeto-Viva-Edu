import { Router } from "express";
import { RelatoriosController } from "../controllers/relatorios.controller";
import { authenticate } from "../middlewares/auth.middleware"; 
import { relatorioUpload } from "../config/upload-relatorio";

const router = Router();
const controller = new RelatoriosController();

// POST /aulas/:id/relatorio (arquivo + observacoes)
router.post("/aulas/:id/relatorio", authenticate, relatorioUpload.single("arquivo"), (req, res) =>
  controller.createForAula(req as any, res)
);

// GET /aulas/:id/relatorio
router.get("/aulas/:id/relatorio", authenticate, (req, res) =>
  controller.listByAula(req as any, res)
);

// GET /relatorios
router.get("/relatorios", authenticate, (req, res) => controller.list(req as any, res));

export default router;
