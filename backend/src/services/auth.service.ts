import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserMongoRepository } from '../repositories/user.mongo';
import { UserNeo4jRepository } from '../repositories/user.neo4j';
import { User, UserRole } from '../models/user.model';

export class AuthService {
  private userRepo = new UserMongoRepository();
  private userGraph = new UserNeo4jRepository();

  private normalizeEmail(email: string): string {
    return (email || '').trim().toLowerCase();
  }

  private validateRole(role: UserRole): void {
    const allowed: UserRole[] = ['ALUNO', 'TUTOR', 'COORDENADOR'];
    if (!allowed.includes(role)) {
      throw new Error('Role inválida');
    }
  }

  async register(data: User) {
    const email = this.normalizeEmail(data.email);
    const role = (data.role as UserRole);

    this.validateRole(role);

    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error('Email já cadastrado');
    }

    const hash = await bcrypt.hash(data.senha, 10);

    const userToCreate: User = {
      ...data,
      email,
      role,
      senha: hash,
      ativo: true,
      createdAt: new Date()
    };

    // 1) salva no Mongo
    const created = await this.userRepo.create(userToCreate);

    // 2) salva o nó no Neo4j (mínimo: id, nome, role)
    await this.userGraph.createUserNode(
      created._id!, // idMongo
      created.nome,
      created.role
    );

    // não devolve senha
    return {
      _id: created._id,
      nome: created.nome,
      email: created.email,
      role: created.role,
      ativo: (created as any).ativo ?? true,
      createdAt: created.createdAt
    };
  }

  async login(email: string, senha: string) {
    const normalizedEmail = this.normalizeEmail(email);

    const user = await this.userRepo.findByEmail(normalizedEmail);

    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    if ((user as any).ativo === false) {
      throw new Error('Usuário desativado');
    }

    const valid = await bcrypt.compare(senha, user.senha);

    if (!valid) {
      throw new Error('Email ou senha inválidos');
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return {
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    };
  }
}
