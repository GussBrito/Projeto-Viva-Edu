import { UserMongoRepository } from '../repositories/user.mongo';
import { CursoStatus, TutorDocs, User } from '../models/user.model';
import { UserNeo4jRepository } from '../repositories/user.neo4j';

export class TutorsService {
  private userRepo = new UserMongoRepository();
  private graph = new UserNeo4jRepository();

  async updateMe(userId: string, data: Partial<User>) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('Usuário não encontrado');
    if (user.role !== 'TUTOR') throw new Error('Apenas TUTOR');

    const patch: Partial<User> = {
      areaAtuacao: data.areaAtuacao?.trim(),
      formacao: data.formacao?.trim(),
      situacaoCurso: data.situacaoCurso as CursoStatus
    };

    if (!patch.areaAtuacao || !patch.formacao || !patch.situacaoCurso) {
      throw new Error('Campos obrigatórios: areaAtuacao, formacao, situacaoCurso');
    }
    if (!['CURSANDO', 'CONCLUIDO'].includes(patch.situacaoCurso)) {
      throw new Error('situacaoCurso inválida');
    }

    const ok = await this.userRepo.updateTutorProfile(userId, patch);
    if (!ok) throw new Error('Não foi possível atualizar');

    const updated = await this.userRepo.findById(userId);
    if (!updated) throw new Error('Usuário não encontrado');

    const { senha, ...safe } = updated as any;
    return safe;
  }

  async saveDocuments(userId: string, docs: TutorDocs) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('Usuário não encontrado');
    if (user.role !== 'TUTOR') throw new Error('Apenas TUTOR');

    if (!docs.comprovanteUrl || !docs.identidadeUrl) {
      throw new Error('Envie comprovante e identidade');
    }

    const ok = await this.userRepo.setTutorDocs(userId, docs);
    if (!ok) throw new Error('Não foi possível salvar documentos');

    return { uploaded: true, docs };
  }

  // coordenador listar pendentes
  async listPendingTutors() {
    const list = await this.userRepo.findPendingTutors();

    return list.map((u: any) => {
      const { senha, ...safe } = u;
      return safe;
    });
  }

  // COORDENADOR valida tutor + grava no Neo4j
  async validateTutor(coordId: string, tutorId: string, validado: boolean) {
    const tutor = await this.userRepo.findById(tutorId);
    if (!tutor) throw new Error('Tutor não encontrado');
    if (tutor.role !== 'TUTOR') throw new Error('Usuário não é TUTOR');

    if (!tutor.docs?.comprovanteUrl || !tutor.docs?.identidadeUrl) {
      throw new Error('Tutor ainda não enviou todos os documentos');
    }

    const ok = await this.userRepo.setTutorValidation(tutorId, validado);
    if (!ok) throw new Error('Não foi possível validar');

    // Neo4j: (COORDENADOR)-[:VALIDA_TUTOR {validado, at}]->(TUTOR)
    await this.graph.createCoordenadorValidaTutor(coordId, tutorId, validado);

    return {
      tutorId,
      tutorValidado: validado
    };
  }
}
