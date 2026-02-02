import { Request, Response } from 'express';
import { TutorsService } from '../services/tutors.service';

const service = new TutorsService();

export class TutorsController {
    async updateMe(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Token inválido' });

            const updated = await service.updateMe(userId, req.body);
            return res.status(200).json(updated);
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    }

    async uploadDocuments(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Token inválido' });

            const files = req.files as Record<string, Express.Multer.File[]>;
            const comprovante = files?.comprovante?.[0];
            const identidade = files?.identidade?.[0];

            if (!comprovante || !identidade) {
                return res.status(400).json({ error: 'Envie comprovante e identidade' });
            }

            const docs = {
                comprovanteUrl: `/uploads/tutors/${comprovante.filename}`,
                identidadeUrl: `/uploads/tutors/${identidade.filename}`
            };

            const result = await service.saveDocuments(userId, docs);
            return res.status(200).json(result);
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    }

    // COORDENADOR: listar pendentes
    async pending(_req: Request, res: Response) {
        try {
            const list = await service.listPendingTutors();
            return res.status(200).json(list);
        } catch (e: any) {
            return res.status(500).json({ error: e.message || 'Erro ao listar pendentes' });
        }
    }

    // COORDENADOR: validar tutor
    async validate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { validado } = req.body;

      if (typeof validado !== 'boolean') {
        return res.status(400).json({ error: 'Campo "validado" deve ser boolean' });
      }

      const result = await service.validateTutor(id, validado);
      return res.status(200).json(result);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }
}
