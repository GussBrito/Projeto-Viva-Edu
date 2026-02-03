import { ObjectId } from 'mongodb';
import { client } from '../config/mongo';
import { Aula, AulaStatus } from '../models/aula.model';

const COLLECTION = 'aulas';

export class AulaMongoRepository {
  private collection() {
    return client.db().collection<Aula>(COLLECTION);
  }

  private oid(id: string) {
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
  }

  async create(aula: Aula) {
    const result = await this.collection().insertOne(aula);
    return { ...aula, _id: result.insertedId.toString() };
  }

  async findById(id: string) {
    const _id = this.oid(id);
    if (!_id) return null;
    return this.collection().findOne({ _id } as any);
  }

  async listAvailable() {
    return this.collection()
      .find({ status: 'DISPONIVEL' as AulaStatus })
      .sort({ createdAt: -1 } as any)
      .toArray();
  }

  async listByTutor(tutorId: string) {
    return this.collection()
      .find({ tutorId })
      .sort({ createdAt: -1 } as any)
      .toArray();
  }

  async updateById(id: string, tutorId: string, patch: Partial<Aula>) {
    const _id = this.oid(id);
    if (!_id) return false;

    const res = await this.collection().updateOne(
      { _id, tutorId } as any,  // só o dono edita
      { $set: patch }
    );
    return res.matchedCount === 1;
  }

  async deleteById(id: string, tutorId: string) {
    const _id = this.oid(id);
    if (!_id) return false;

    const res = await this.collection().deleteOne({ _id, tutorId } as any);
    return res.deletedCount === 1;
  }
}
