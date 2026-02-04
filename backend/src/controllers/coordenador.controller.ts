import { Request, Response } from "express";
import { CoordenadorService } from "../services/coordenador.service";

const service = new CoordenadorService();

type ReqUser = { id: string; role: string };
type AuthedRequest = Request & { user?: ReqUser };

function assertCoord(req: AuthedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Não autenticado" });
    return null;
  }
  if (String(user.role || "").toUpperCase() !== "COORDENADOR") {
    res.status(403).json({ error: "Apenas COORDENADOR" });
    return null;
  }
  return user;
}

export class CoordenadorController {
  async alunos(req: AuthedRequest, res: Response) {
    try {
      if (!assertCoord(req, res)) return;
      const list = await service.listAlunos();
      return res.status(200).json(list);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Erro ao listar alunos" });
    }
  }

  async tutores(req: AuthedRequest, res: Response) {
    try {
      if (!assertCoord(req, res)) return;
      const list = await service.listTutores();
      return res.status(200).json(list);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Erro ao listar tutores" });
    }
  }

  async aulas(req: AuthedRequest, res: Response) {
    try {
      if (!assertCoord(req, res)) return;
      const list = await service.listAulas();
      return res.status(200).json(list);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Erro ao listar aulas" });
    }
  }
}
