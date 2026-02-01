import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const service = new AuthService();

export class AuthController {
    async register(req: Request, res: Response) {
  try {
    const { nome, cpf, email, senha, role } = req.body;

    // validação mínima obrigatória
    if (!nome || !cpf || !email || !senha || !role) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome, cpf, email, senha, role'
      });
    }

    const user = await service.register({ nome, cpf, email, senha, role });

    return res.status(201).json(user);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}


    async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios' });
            }

            const result = await service.login(email, senha);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(401).json({ error: error.message });
        }
    }

}
