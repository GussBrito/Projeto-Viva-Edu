export type AgendamentoStatus = 'PENDENTE' | 'CONFIRMADO' | 'REJEITADO';

export interface Agendamento {
  _id?: string;

  aulaId: string;
  alunoId: string;
  tutorId: string;

  status: AgendamentoStatus;
  createdAt: Date;
}
