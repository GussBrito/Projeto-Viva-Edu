export type UserRole = 'ALUNO' | 'TUTOR' | 'COORDENADOR';

export interface User {
  _id?: string;
  nome: string;
  email: string;
  senha: string;
  ativo?: boolean;
  role: UserRole;

  // campos aluno (opcionais)
  idade?: number;
  serie?: string;

  // campos tutor (opcionais)
  areaAtuacao?: string;
  formacao?: string;

  // campos coordenador (opcional por enquanto)
  // ex: unidade?: string;

  createdAt: Date;
}
