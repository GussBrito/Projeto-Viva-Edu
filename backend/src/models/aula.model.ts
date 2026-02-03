export type AulaStatus = 'DISPONIVEL' | 'INATIVA';

export interface Aula {
  _id?: string;

  tutorId: string;       // vem do token
  materiaId: string;     // id da matéria (subjects)
  titulo: string;
  descricao: string;

  // o guia fala em dataHora / assunto / disciplina (você pode adaptar)
  dataHora: string;      // ISO string (ex: 2026-02-05T19:00:00.000Z)

  // opcional (futuro/local)
  localId?: string;

  status: AulaStatus;
  createdAt: Date;
}
