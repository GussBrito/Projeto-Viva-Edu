export type UserRole = 'ALUNO' | 'TUTOR';

export interface User {
  _id?: string;

  nome: string;
  cpf: string;
  email: string;
  senha: string;
  role: UserRole;

  // comuns
  telefone?: string;

  // aluno
  idade?: number;
  serie?: string;

  // tutor
  areaAtuacao?: string;
  formacao?: string;

  createdAt: Date;
}
