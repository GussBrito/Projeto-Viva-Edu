import { UserMongoRepository } from '../repositories/user.mongo';
import { UserNeo4jRepository } from '../repositories/user.neo4j';
import { UserRole } from '../models/user.model';

export class UsersService {
  private userRepo = new UserMongoRepository();
  private userGraph = new UserNeo4jRepository();

  async getMe(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('Usuário não encontrado');

    const { senha, ...safe } = user as any;
    return safe;
  }

  async listAll() {
    return this.userRepo.findAll();
  }

  async setStatus(id: string, ativo: boolean) {
    const ok = await this.userRepo.setStatus(id, ativo);
    if (!ok) throw new Error('Usuário não encontrado');
    return { ativo };
  }

  async setRole(id: string, role: UserRole) {
    const allowed: UserRole[] = ['ALUNO', 'TUTOR', 'COORDENADOR', 'ADMIN'];
    if (!allowed.includes(role)) throw new Error('Role inválida');

    const ok = await this.userRepo.setRole(id, role);
    if (!ok) throw new Error('Usuário não encontrado');

    return { role };
  }

  async deleteUser(id: string) {
    const deletedMongo = await this.userRepo.deleteById(id);
    if (!deletedMongo) throw new Error('Usuário não encontrado');

    // remove do grafo 
    await this.userGraph.deleteUserNode(id);

    return { deleted: true };
  }
}
