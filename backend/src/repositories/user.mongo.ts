import { ObjectId } from 'mongodb';
import { client } from '../config/mongo';
import { TutorDocs, User, UserRole } from '../models/user.model';

const COLLECTION = 'users';

export class UserMongoRepository {
  private collection() {
    return client.db().collection<User>(COLLECTION);
  }

  // ===== helpers =====
  private toObjectId(id: string): ObjectId | null {
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
  }

  // ===== queries base =====
  async findByEmail(email: string) {
    return this.collection().findOne({ email });
  }

  async findById(id: string) {
    const oid = this.toObjectId(id);
    if (!oid) return null;
    return this.collection().findOne({ _id: oid } as any);
  }

  async findAll() {
    // não retornar senha
    return this.collection()
      .find({}, { projection: { senha: 0 } as any })
      .toArray();
  }

  // listar por role (COORDENADOR usa pra ALUNO/TUTOR)
  async findByRole(role: UserRole) {
    const users = await this.collection()
      .find({ role } as any, { projection: { senha: 0 } as any })
      .sort({ createdAt: -1 } as any)
      .toArray();

    return users.map(u => ({ ...u, _id: String((u as any)._id) }));
  }

  async create(user: User) {
    const result = await this.collection().insertOne(user);
    return { ...user, _id: result.insertedId.toString() };
  }

  async deleteById(id: string) {
    const oid = this.toObjectId(id);
    if (!oid) return false;

    const result = await this.collection().deleteOne({ _id: oid } as any);
    return result.deletedCount === 1;
  }

  // ===== admin actions =====
  async setStatus(id: string, ativo: boolean) {
    const oid = this.toObjectId(id);
    if (!oid) return false;

    const result = await this.collection().updateOne(
      { _id: oid } as any,
      { $set: { ativo } }
    );
    return result.matchedCount === 1;
  }

  async setRole(id: string, role: UserRole) {
    const oid = this.toObjectId(id);
    if (!oid) return false;

    const result = await this.collection().updateOne(
      { _id: oid } as any,
      { $set: { role } }
    );
    return result.matchedCount === 1;
  }

  // ===== tutor flow (perfil + docs + validação) =====

  async updateTutorProfile(
    id: string,
    patch: Pick<User, 'areaAtuacao' | 'formacao' | 'situacaoCurso'>
  ) {
    const oid = this.toObjectId(id);
    if (!oid) return false;

    const result = await this.collection().updateOne(
      { _id: oid, role: 'TUTOR' } as any,
      { $set: patch }
    );

    return result.matchedCount === 1;
  }

  async setTutorDocs(id: string, docs: TutorDocs) {
    const oid = this.toObjectId(id);
    if (!oid) return false;

    const result = await this.collection().updateOne(
      { _id: oid, role: 'TUTOR' } as any,
      { $set: { docs } }
    );

    return result.matchedCount === 1;
  }

  async findPendingTutors() {
    return this.collection()
      .find(
        { role: 'TUTOR', tutorValidado: false },
        { projection: { senha: 0 } as any }
      )
      .toArray();
  }

  async setTutorValidation(id: string, validado: boolean) {
    const oid = this.toObjectId(id);
    if (!oid) return false;

    const result = await this.collection().updateOne(
      { _id: oid, role: 'TUTOR' } as any,
      {
        $set: {
          tutorValidado: validado,
          tutorValidadoEm: new Date()
        }
      }
    );

    return result.matchedCount === 1;
  }

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

    return users.map(u => ({ ...u, _id: String((u as any)._id) }));
  }
}
