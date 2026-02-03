import { ObjectId } from 'mongodb';
import { client } from '../config/mongo';
import { Materia } from '../models/materia.model';

const COLLECTION = 'materias';

export class MateriaMongoRepository {
  private collection() {
    return client.db().collection<Materia>(COLLECTION);
  }

  private toObjectId(id: string): ObjectId | null {
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
  }

  async findAll(includeInactive = false) {
    const filter = includeInactive ? {} : { ativo: true };
    return this.collection().find(filter).toArray();
  }

  async findById(id: string) {
    const oid = this.toObjectId(id);
    if (!oid) return null;
    return this.collection().findOne({ _id: oid } as any);
  }

  async findByName(nome: string) {
    return this.collection().findOne({ nome });
  }

  async create(materia: Materia) {
    const result = await this.collection().insertOne(materia);
    return { ...materia, _id: result.insertedId.toString() };
  }

  async updateById(id: string, patch: Partial<Materia>) {
    const oid = this.toObjectId(id);
    if (!oid) return false;

    const res = await this.collection().updateOne(
      { _id: oid } as any,
      { $set: patch }
    );

    return res.matchedCount === 1;
  }

  async deleteById(id: string) {
    const oid = this.toObjectId(id);
    if (!oid) return false;

    const res = await this.collection().deleteOne({ _id: oid } as any);
    return res.deletedCount === 1;
  }

  //buscar vários usuários públicos por IDs
  async findPublicByIds(ids: string[]) {
    const objectIds = ids
      .filter(Boolean)
      .map(id => new ObjectId(id));

    const users = await this.collection()
      .find(
        { _id: { $in: objectIds } } as any,
        { projection: { senha: 0 } as any }
      )
      .toArray();

    // garante _id string
    return users.map(u => ({ ...u, _id: String((u as any)._id) }));
  }
  async findByIds(ids: string[]) {
    const objectIds = ids
      .filter(Boolean)
      .map(id => new ObjectId(id));

    const materias = await this.collection()
      .find({ _id: { $in: objectIds } } as any)
      .toArray();

    return materias.map(m => ({ ...m, _id: String((m as any)._id) }));
  }
}
