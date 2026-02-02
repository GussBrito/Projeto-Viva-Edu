export type UserRole = 'ALUNO' | 'TUTOR' | 'COORDENADOR' | 'ADMIN';

export type CursoStatus = 'CURSANDO' | 'CONCLUIDO';

export interface TutorDocs {
  comprovanteUrl?: string; // nome do arquivo ou URL
  identidadeUrl?: string;  // nome do arquivo ou URL
}

export interface User {
  _id?: string;

  nome: string;
  cpf: string;
  email: string;
  senha: string;

  role: UserRole;
  ativo?: boolean;

  createdAt?: Date;

  // =========================
  // CAMPOS ALUNO (opcionais)
  // =========================
  idade?: number;
  serie?: string;

  // =========================
  // CAMPOS TUTOR (opcionais)
  // =========================
  areaAtuacao?: string;
  formacao?: string;
  situacaoCurso?: CursoStatus;

  // documentos enviados pro coordenador validar
  docs?: TutorDocs;

  // validação do tutor (por coordenador)
  tutorValidado?: boolean;
  tutorValidadoEm?: Date;

  // =========================
  // CAMPOS COORDENADOR (opcionais)
  // =========================
  // unidade?: string;
}
