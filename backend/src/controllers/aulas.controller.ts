import { Request, Response } from 'express';
import { AulasService } from '../services/aulas.service';

const service = new AulasService();

export class AulasController {
  async create(req: Request, res: Response) {
    try {
      const tutorId = req.user?.id;
      if (!tutorId) return res.status(401).json({ error: 'Token inválido' });

      const aula = await service.create(tutorId, req.body);
      return res.status(201).json(aula);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const aulas = await service.listAvailable();
      return res.status(200).json(aulas);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  async mine(req: Request, res: Response) {
    try {
      const tutorId = req.user?.id;
      if (!tutorId) return res.status(401).json({ error: 'Token inválido' });

      const aulas = await service.listMine(tutorId);
      return res.status(200).json(aulas);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const tutorId = req.user?.id;
      if (!tutorId) return res.status(401).json({ error: 'Token inválido' });

      const { id } = req.params;
      const aula = await service.update(id, tutorId, req.body);
      return res.status(200).json(aula);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const tutorId = req.user?.id;
      if (!tutorId) return res.status(401).json({ error: 'Token inválido' });

      const { id } = req.params;
      const out = await service.remove(id, tutorId);
      return res.status(200).json(out);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }
}
