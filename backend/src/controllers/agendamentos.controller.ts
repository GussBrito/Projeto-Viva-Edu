import { Request, Response } from 'express';
import { AgendamentosService } from '../services/agendamentos.service';

const service = new AgendamentosService();

// tipagem simples pro req.user
type ReqUser = { id: string; role: string };
type AuthedRequest = Request & { user?: ReqUser };

export class AgendamentosController {
    //criar agendamento
  async create(req: AuthedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Não autenticado' });
      if (user.role !== 'ALUNO') return res.status(403).json({ error: 'Apenas ALUNO pode agendar' });

      const { aulaId } = req.body;
      if (!aulaId) return res.status(400).json({ error: 'aulaId é obrigatório' });

      const ag = await service.createAgendamento(user.id, aulaId);
      return res.status(201).json(ag);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async my(req: AuthedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Não autenticado' });
      if (user.role !== 'ALUNO') return res.status(403).json({ error: 'Apenas ALUNO' });

      const list = await service.listMyAgendamentos(user.id);
      return res.status(200).json(list);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  //listar agendamentos do tutor
    async mineTutor(req: any, res: any) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Não autenticado' });
      if (user.role !== 'TUTOR') return res.status(403).json({ error: 'Apenas TUTOR' });

      const list = await service.listMineTutor(user.id);
      return res.status(200).json(list);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async confirm(req: any, res: any) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Não autenticado' });
      if (user.role !== 'TUTOR') return res.status(403).json({ error: 'Apenas TUTOR' });

      const { id } = req.params;
      const result = await service.confirmAsTutor(user.id, id);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async reject(req: any, res: any) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Não autenticado' });
      if (user.role !== 'TUTOR') return res.status(403).json({ error: 'Apenas TUTOR' });

      const { id } = req.params;
      const result = await service.rejectAsTutor(user.id, id);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

}
