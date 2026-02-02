import { Request, Response } from 'express';
import { MateriasService } from '../services/materias.service';

const service = new MateriasService();

export class MateriasController {
  async list(req: Request, res: Response) {
    try {
      const role = req.user?.role;
      const materias = await service.list(role);
      return res.status(200).json(materias);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Erro ao listar matérias' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { nome, descricao } = req.body;
      if (!nome) return res.status(400).json({ error: 'nome é obrigatório' });

      const created = await service.create({ nome, descricao });
      return res.status(201).json(created);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await service.update(id, req.body);
      return res.status(200).json(updated);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await service.remove(id);
      return res.status(200).json(result);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }
}
