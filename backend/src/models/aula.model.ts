export type AulaStatus = 'DISPONIVEL' | 'INATIVA';

export interface Aula {
  _id?: string;

  tutorId: string;       
  materiaId: string;     
  titulo: string;
  descricao: string;

  dataHora: string;

  localId?: string;

  status: AulaStatus;
  createdAt: Date;
}
