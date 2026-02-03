import { AgendamentoMongoRepository } from '../repositories/agendamentos.mongo';
import { Agendamento, AgendamentoStatus } from '../models/agendamento.model';

import { AulaMongoRepository } from '../repositories/aula.mongo';
import { MateriaMongoRepository } from '../repositories/materia.mongo';
import { UserMongoRepository } from '../repositories/user.mongo';
import { UserNeo4jRepository } from '../repositories/user.neo4j';

type AgendamentoMeView = {
  _id: string;
  status: AgendamentoStatus;
  createdAt: Date;
  aula: {
    _id: string;
    titulo: string;
    materiaId: string;
    materiaNome: string;
    dataHora: string;
    localId?: string;
    tutor: { id: string; nome: string };
  };
};

export class AgendamentosService {
  private repo = new AgendamentoMongoRepository();
  private aulasRepo = new AulaMongoRepository();
  private materiasRepo = new MateriaMongoRepository();
  private usersRepo = new UserMongoRepository();
  private graph = new UserNeo4jRepository();

  async createAgendamento(alunoId: string, aulaId: string): Promise<Agendamento> {
    const aula = await this.aulasRepo.findById(aulaId);
    if (!aula) throw new Error('Aula não encontrada');

    if (aula.status && aula.status !== 'DISPONIVEL') {
      throw new Error('Aula não está disponível para agendamento');
    }

    const existing = await this.repo.findPendingByAulaAndAluno(aulaId, alunoId);
    if (existing) throw new Error('Você já possui um agendamento para esta aula');

    const ag: Agendamento = {
      aulaId,
      alunoId,
      tutorId: aula.tutorId,
      status: 'PENDENTE',
      createdAt: new Date()
    };

    // cria no Mongo
    const created = await this.repo.create(ag);

    // cria relação no Neo4j: (Aluno)-[:AGENDA {status:PENDENTE}]->(Aula)
    // Pressupõe que o nó Aula já existe (criado ao criar aula)
    await this.graph.createAlunoAgendaAula(alunoId, aulaId, 'PENDENTE');

    return created;
  }

  //RETORNO "LIMPO" COM tutorNome + materiaNome
  async listMyAgendamentos(alunoId: string): Promise<AgendamentoMeView[]> {
    const ags = await this.repo.findByAluno(alunoId);

    const aulaIds = [...new Set(ags.map(a => a.aulaId).filter(Boolean))];

    // tenta batch (findByIds). Se não existir, fallback
    let aulas: any[] = [];
    const anyRepo = this.aulasRepo as any;

    if (typeof anyRepo.findByIds === 'function') {
      aulas = await anyRepo.findByIds(aulaIds);
    } else {
      const results = await Promise.all(aulaIds.map(id => this.aulasRepo.findById(id)));
      aulas = results.filter(Boolean);
    }

    const aulaMap = new Map(aulas.map(a => [String(a._id), a]));

    const tutorIds = [...new Set(aulas.map(a => a.tutorId).filter(Boolean))];
    const materiaIds = [...new Set(aulas.map(a => a.materiaId).filter(Boolean))];

    const [tutores, materias] = await Promise.all([
      this.usersRepo.findPublicByIds(tutorIds),
      this.materiasRepo.findByIds(materiaIds)
    ]);

    const tutorMap = new Map(tutores.map(t => [String(t._id), t.nome]));
    const materiaMap = new Map(materias.map(m => [String((m as any)._id), (m as any).nome]));

    return ags.map((ag: any) => {
      const aula = aulaMap.get(String(ag.aulaId));

      // se a aula sumiu (ex: foi deletada)
      if (!aula) {
        return {
          _id: String(ag._id),
          status: ag.status,
          createdAt: ag.createdAt,
          aula: {
            _id: String(ag.aulaId),
            titulo: '[Aula removida]',
            materiaId: '',
            materiaNome: '',
            dataHora: '',
            localId: '',
            tutor: { id: '', nome: '' }
          }
        };
      }

      const tutorNome = tutorMap.get(String(aula.tutorId)) || 'Tutor';
      const materiaNome = materiaMap.get(String(aula.materiaId)) || 'Matéria';

      return {
        _id: String(ag._id),
        status: ag.status,
        createdAt: ag.createdAt,
        aula: {
          _id: String(aula._id),
          titulo: aula.titulo,
          materiaId: aula.materiaId,
          materiaNome,
          dataHora: aula.dataHora,
          localId: aula.localId,
          tutor: { id: String(aula.tutorId), nome: tutorNome }
        }
      };
    });
  }

  async listMineTutor(tutorId: string) {
    const list = await this.repo.findByTutor(tutorId);

    const alunoIds = Array.from(new Set((list || []).map(a => a.alunoId).filter(Boolean)));

    const alunos = await this.usersRepo.findPublicByIds(alunoIds);
    const alunoNomeById = new Map(alunos.map((u: any) => [String(u._id), u.nome]));

    return (list || []).map((ag: any) => ({
      ...ag,
      alunoNome: alunoNomeById.get(String(ag.alunoId)) || 'Aluno'
    }));
  }

  private async changeStatusAsTutor(tutorId: string, agId: string, status: AgendamentoStatus) {
    const ag = await this.repo.findById(agId);
    if (!ag) throw new Error('Agendamento não encontrado');

    if ((ag as any).tutorId !== tutorId) {
      throw new Error('Acesso negado: agendamento não pertence a este tutor');
    }

    if ((ag as any).status !== 'PENDENTE') {
      throw new Error('Só é possível alterar agendamentos PENDENTES');
    }

    // atualiza Mongo
    const ok = await this.repo.setStatus(agId, status);
    if (!ok) throw new Error('Falha ao atualizar status');

    // atualiza Neo4j: status na relação (Aluno)-[:AGENDA]->(Aula)
    await this.graph.updateAgendaStatus((ag as any).alunoId, (ag as any).aulaId, status);

    return { status };
  }

  async confirmAsTutor(tutorId: string, agId: string) {
    return this.changeStatusAsTutor(tutorId, agId, 'CONFIRMADO');
  }

  async rejectAsTutor(tutorId: string, agId: string) {
    return this.changeStatusAsTutor(tutorId, agId, 'REJEITADO');
  }

  async cancelAsAluno(alunoId: string, agId: string) {
    const ag = await this.repo.findById(agId);
    if (!ag) throw new Error('Agendamento não encontrado');

    if ((ag as any).alunoId !== alunoId) {
      throw new Error('Acesso negado: agendamento não pertence a este aluno');
    }

    if ((ag as any).status !== 'PENDENTE') {
      throw new Error('Só é possível cancelar agendamentos PENDENTES');
    }

    // remove do Mongo
    const ok = await this.repo.deleteById(agId);
    if (!ok) throw new Error('Falha ao cancelar agendamento');

    // remove a relação no Neo4j
    await this.graph.deleteAgendaRelation(alunoId, (ag as any).aulaId);

    return { cancelled: true };
  }
}
