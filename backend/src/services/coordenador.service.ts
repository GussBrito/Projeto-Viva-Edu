import { AulaMongoRepository } from "../repositories/aula.mongo";
import { MateriaMongoRepository } from "../repositories/materia.mongo";
import { UserMongoRepository } from "../repositories/user.mongo";

type CoordenadorUserView = {
  _id: string;
  nome: string;
  email: string;
  role: string;
  ativo?: boolean;
  createdAt?: Date;

  tutorValidado?: boolean;
  tutorValidadoEm?: Date;
  docs?: any;
};

type CoordenadorAulaView = {
  _id: string;
  materiaId: string;
  materiaNome: string;

  titulo: string;
  tutorId: string;
  tutorNome: string;

  dataHora?: string;
  status: string;
  localId?: string;

  createdAt?: Date;
};

export class CoordenadorService {
  private users = new UserMongoRepository();
  private aulas = new AulaMongoRepository();
  private materias = new MateriaMongoRepository();

  private stripUser(u: any): CoordenadorUserView {
    return {
      _id: String(u._id),
      nome: u.nome,
      email: u.email,
      role: u.role,
      ativo: u.ativo,
      createdAt: u.createdAt,

      tutorValidado: u.tutorValidado,
      tutorValidadoEm: u.tutorValidadoEm,
      docs: u.docs
    };
  }

  async listAlunos(): Promise<CoordenadorUserView[]> {
    const alunos = await this.users.findByRole("ALUNO" as any);
    return (alunos || []).map(u => this.stripUser(u));
  }

  async listTutores(): Promise<CoordenadorUserView[]> {
    const tutores = await this.users.findByRole("TUTOR" as any);
    return (tutores || []).map(u => this.stripUser(u));
  }

  async listAulas(): Promise<CoordenadorAulaView[]> {
    const aulasRaw = await this.aulas.listAll();

    // força tipos para string[]
    const tutorIds: string[] = Array.from(
      new Set((aulasRaw || []).map((a: any) => a?.tutorId).filter(Boolean).map((x: any) => String(x)))
    );

    const materiaIds: string[] = Array.from(
      new Set((aulasRaw || []).map((a: any) => a?.materiaId).filter(Boolean).map((x: any) => String(x)))
    );

    const [tutores, materias] = await Promise.all([
      this.users.findPublicByIds(tutorIds),
      this.materias.findByIds(materiaIds)
    ]);

    const tutorMap = new Map((tutores || []).map((t: any) => [String(t._id), t.nome]));
    const materiaMap = new Map(
      (materias || []).map((m: any) => [String(m._id), (m as any).nome || (m as any).titulo || ""])
    );

    return (aulasRaw || []).map((a: any) => ({
      _id: String(a._id),
      materiaId: String(a.materiaId),
      materiaNome: materiaMap.get(String(a.materiaId)) || "Matéria",

      titulo: a.titulo,
      tutorId: String(a.tutorId),
      tutorNome: tutorMap.get(String(a.tutorId)) || "Tutor",

      dataHora: a.dataHora,
      status: String(a.status || "DISPONIVEL"),
      localId: a.localId,

      createdAt: a.createdAt
    }));
  }
}
