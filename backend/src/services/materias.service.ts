import { MateriaMongoRepository } from '../repositories/materia.mongo';
import { Materia } from '../models/materia.model';

export class MateriasService {
  private repo = new MateriaMongoRepository();

  private normalizeName(nome: string) {
    return (nome || '').trim();
  }

  // ADMIN/COORDENADOR podem ver inativas (opcional)
  async list(userRole?: string) {
    const includeInactive = userRole === 'ADMIN' || userRole === 'COORDENADOR';
    return this.repo.findAll(includeInactive);
  }

  async create(data: { nome: string; descricao?: string }) {
    const nome = this.normalizeName(data.nome);
    if (!nome) throw new Error('Nome é obrigatório');

    const existing = await this.repo.findByName(nome);
    if (existing) throw new Error('Matéria já existe');

    const materia: Materia = {
      nome,
      descricao: (data.descricao || '').trim(),
      ativo: true,
      createdAt: new Date()
    };

    return this.repo.create(materia);
  }

  async update(
    id: string,
    patch: Partial<Pick<Materia, 'nome' | 'descricao' | 'ativo'>>
  ) {
    const toSet: Partial<Materia> = {};

    if (patch.nome !== undefined) {
      const nome = this.normalizeName(patch.nome);
      if (!nome) throw new Error('Nome inválido');

      const existing = await this.repo.findByName(nome);
      if (existing && existing._id?.toString() !== id) {
        throw new Error('Já existe matéria com esse nome');
      }
      toSet.nome = nome;
    }

    if (patch.descricao !== undefined) {
      toSet.descricao = (patch.descricao || '').trim();
    }

    if (patch.ativo !== undefined) {
      toSet.ativo = !!patch.ativo;
    }

    const ok = await this.repo.updateById(id, toSet);
    if (!ok) throw new Error('Matéria não encontrada');

    const updated = await this.repo.findById(id);
    if (!updated) throw new Error('Matéria não encontrada');

    // normaliza _id pra string
    return { ...updated, _id: (updated as any)._id?.toString?.() ?? (updated as any)._id };
  }

  async remove(id: string) {
    const ok = await this.repo.deleteById(id);
    if (!ok) throw new Error('Matéria não encontrada');
    return { deleted: true };
  }
}
