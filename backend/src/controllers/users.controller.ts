import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';

const service = new UsersService();

export class UsersController {
    /**
     * GET /users/me
     * Retorna dados do usuário logado (via token)
     */
    async me(req: Request, res: Response) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Token inválido' });
            }

            const me = await service.getMe(userId);
            return res.status(200).json(me);
        } catch (err: any) {
            return res.status(404).json({ error: err?.message || 'Usuário não encontrado' });
        }
    }

    /**
     * GET /users
     * ADMIN - lista todos os usuários (sem senha)
     */
    async list(req: Request, res: Response) {
        try {
            const users = await service.listAll();
            return res.status(200).json(users);
        } catch (err: any) {
            return res.status(500).json({ error: 'Erro ao listar usuários' });
        }
    }

    /**
     * PUT /users/:id/status
     * ADMIN - ativa/desativa usuário
     * body: { ativo: boolean }
     */
    async setStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { ativo } = req.body;

            if (typeof ativo !== 'boolean') {
                return res.status(400).json({ error: 'Campo "ativo" deve ser boolean' });
            }

            const result = await service.setStatus(id, ativo);
            return res.status(200).json(result);
        } catch (err: any) {
            const msg = err?.message || 'Erro ao atualizar status';
            const code = msg.toLowerCase().includes('não encontrado') ? 404 : 400;
            return res.status(code).json({ error: msg });
        }
    }

    /**
     * PUT /users/:id/role
     * ADMIN - muda role do usuário
     * body: { role: "ALUNO"|"TUTOR"|"COORDENADOR"|"ADMIN" }
     */
    async setRole(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (!role || typeof role !== 'string') {
                return res.status(400).json({ error: 'Campo "role" é obrigatório' });
            }

            const normalizedRole = role.toUpperCase().trim();
            const result = await service.setRole(id, normalizedRole as any);

            return res.status(200).json(result);
        } catch (err: any) {
            const msg = err?.message || 'Erro ao atualizar role';
            const code = msg.toLowerCase().includes('não encontrado') ? 404 : 400;
            return res.status(code).json({ error: msg });
        }
    }

    /**
     * DELETE /users/:id
     * ADMIN - exclui usuário (Mongo + Neo4j)
     */
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            await service.deleteUser(id);
            return res.status(204).send();
        } catch (err: any) {
            const msg = err?.message || 'Erro ao excluir usuário';
            const code = msg.toLowerCase().includes('não encontrado') ? 404 : 400;
            return res.status(code).json({ error: msg });
        }
    }
}
