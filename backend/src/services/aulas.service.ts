import { AulaMongoRepository } from '../repositories/aula.mongo';
import { MateriaMongoRepository } from '../repositories/materia.mongo';
import { UserMongoRepository } from '../repositories/user.mongo';
import { Aula } from '../models/aula.model';

export class AulasService {
  private aulas = new AulaMongoRepository();
  private materias = new MateriaMongoRepository();
  private users = new UserMongoRepository();

  private async assertTutorValidado(tutorId: string) {
    const tutor = await this.users.findById(tutorId);
    if (!tutor) throw new Error('Usuário não encontrado');
    if (tutor.role !== 'TUTOR') throw new Error('Apenas TUTOR');
    if ((tutor as any).ativo === false) throw new Error('Usuário desativado');

    // RN01: voluntário precisa ser validado antes de oferecer aulas
    if ((tutor as any).tutorValidado !== true) {
      throw new Error('Tutor ainda não validado');
    }
  }

  async create(tutorId: string, data: Partial<Aula>) {
    await this.assertTutorValidado(tutorId);

    const { materiaId, titulo, descricao, dataHora } = data;

    if (!materiaId || !titulo || !descricao || !dataHora) {
      throw new Error('Campos obrigatórios: materiaId, titulo, descricao, dataHora');
    }

    const materia = await this.materias.findById(materiaId);
    if (!materia) throw new Error('Matéria não encontrada');
    if ((materia as any).ativo === false) throw new Error('Matéria inativa');

    // valida data
    const dt = new Date(String(dataHora));
    if (isNaN(dt.getTime())) throw new Error('dataHora inválida');

    const aula: Aula = {
      tutorId,
      materiaId,
      titulo: String(titulo).trim(),
      descricao: String(descricao).trim(),
      dataHora: dt.toISOString(),
      localId: data.localId,
      status: 'DISPONIVEL',
      createdAt: new Date()
    };

    return this.aulas.create(aula);
  }

  async listAvailable() {
    return this.aulas.listAvailable();
  }

  async listMine(tutorId: string) {
    return this.aulas.listByTutor(tutorId);
  }

  async update(id: string, tutorId: string, patch: Partial<Aula>) {
    // patch permitido
    const allowed: (keyof Aula)[] = ['titulo', 'descricao', 'dataHora', 'materiaId', 'status', 'localId'];
    const clean: Partial<Aula> = {};

    for (const k of allowed) {
      if (patch[k] !== undefined) (clean as any)[k] = patch[k];
    }

    if (clean.dataHora) {
      const dt = new Date(String(clean.dataHora));
      if (isNaN(dt.getTime())) throw new Error('dataHora inválida');
      clean.dataHora = dt.toISOString();
    }

    const ok = await this.aulas.updateById(id, tutorId, clean);
    if (!ok) throw new Error('Aula não encontrada ou você não tem permissão');

    return this.aulas.findById(id);
  }

  async remove(id: string, tutorId: string) {
    const ok = await this.aulas.deleteById(id, tutorId);
    if (!ok) throw new Error('Aula não encontrada ou você não tem permissão');
    return { deleted: true };
  }
}
