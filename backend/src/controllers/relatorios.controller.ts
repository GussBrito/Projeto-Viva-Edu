import { Request, Response } from "express";
import { RelatoriosService } from "../services/relatorios.service";

const service = new RelatoriosService();

type ReqUser = { id: string; role: string };
type AuthedRequest = Request & { user?: ReqUser };

export class RelatoriosController {
  async createForAula(req: AuthedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Não autenticado" });
      if (user.role !== "TUTOR") return res.status(403).json({ error: "Apenas TUTOR" });

      const aulaId = req.params.id;
      if (!aulaId) return res.status(400).json({ error: "Parâmetro :id (aulaId) é obrigatório" });

      const observacoes = (req.body?.observacoes || "").toString();

      // multer single => req.file
      const file = (req as any).file as { filename: string; originalname: string; mimetype: string } | undefined;

      const arquivoUrl = file ? `/uploads/relatorios/${file.filename}` : undefined;

      const created = await service.createRelatorioForAula(user.id, aulaId, {
        observacoes,
        arquivoUrl,
        arquivoNome: file?.originalname,
        arquivoMime: file?.mimetype
      });

      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async listByAula(req: AuthedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Não autenticado" });

      const aulaId = req.params.id;
      if (!aulaId) return res.status(400).json({ error: "Parâmetro :id (aulaId) é obrigatório" });

      const list = await service.listByAula(aulaId);
      return res.status(200).json(list);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async list(req: AuthedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Não autenticado" });
      if (user.role !== "COORDENADOR") return res.status(403).json({ error: "Apenas COORDENADOR" });

      const list = await service.listAllForCoordenador();
      return res.status(200).json(list);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
