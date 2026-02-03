import { AgendamentoMongoRepository } from '../repositories/agendamentos.mongo';
import { Agendamento } from '../models/agendamento.model';
import { AgendamentoStatus } from '../models/agendamento.model';

// IMPORTANTE: ajuste esse import conforme seu repo de aulas:
import { AulaMongoRepository } from '../repositories/aula.mongo';

export class AgendamentosService {
  private repo = new AgendamentoMongoRepository();
  private aulasRepo = new AulaMongoRepository();

  async createAgendamento(alunoId: string, aulaId: string): Promise<Agendamento> {
    // 1) aula existe?
    const aula = await this.aulasRepo.findById(aulaId);
    if (!aula) throw new Error('Aula não encontrada');

    // 2) aula disponível? (se seu backend tem status)
    if (aula.status && aula.status !== 'DISPONIVEL') {
      throw new Error('Aula não está disponível para agendamento');
    }

    // 3) duplicidade
    const existing = await this.repo.findPendingByAulaAndAluno(aulaId, alunoId);
    if (existing) throw new Error('Você já possui um agendamento para esta aula');

    // 4) cria agendamento
    const ag: Agendamento = {
      aulaId,
      alunoId,
      tutorId: aula.tutorId, // sua aula precisa ter tutorId
      status: 'PENDENTE',
      createdAt: new Date()
    };

    return this.repo.create(ag);
  }

  async listMyAgendamentos(alunoId: string) {
    return this.repo.findByAluno(alunoId);
  }

  //listar agendamentos do tutor
  async listMineTutor(tutorId: string) {
    return this.repo.findByTutor(tutorId);
  }

  private async changeStatusAsTutor(tutorId: string, agId: string, status: AgendamentoStatus) {
    const ag = await this.repo.findById(agId);
    if (!ag) throw new Error('Agendamento não encontrado');

    if (ag.tutorId !== tutorId) {
      throw new Error('Acesso negado: agendamento não pertence a este tutor');
    }

    if (ag.status !== 'PENDENTE') {
      throw new Error('Só é possível alterar agendamentos PENDENTES');
    }

    const ok = await this.repo.setStatus(agId, status);
    if (!ok) throw new Error('Falha ao atualizar status');
    return { status };
  }

  async confirmAsTutor(tutorId: string, agId: string) {
    return this.changeStatusAsTutor(tutorId, agId, 'CONFIRMADO');
  }

  async rejectAsTutor(tutorId: string, agId: string) {
    return this.changeStatusAsTutor(tutorId, agId, 'REJEITADO');
  }
}

