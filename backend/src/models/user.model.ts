export type UserRole = 'ALUNO' | 'TUTOR' | 'COORDENADOR' | 'ADMIN';

export type CursoStatus = 'CURSANDO' | 'CONCLUIDO';

export interface TutorDocs {
  comprovanteUrl?: string; 
  identidadeUrl?: string;  
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

 
  // CAMPOS ALUNO 

  idade?: number;
  serie?: string;


  // CAMPOS TUTOR 

  areaAtuacao?: string;
  formacao?: string;
  situacaoCurso?: CursoStatus;

  // documentos enviados pro coordenador validar
  docs?: TutorDocs;

  // validação do tutor (por coordenador)
  tutorValidado?: boolean;
  tutorValidadoEm?: Date;
}
