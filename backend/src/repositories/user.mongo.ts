import { ObjectId } from 'mongodb';
import { client } from '../config/mongo';
import { User, UserRole } from '../models/user.model';

const COLLECTION = 'users';

export class UserMongoRepository {
  private collection() {
    return client.db().collection<User>(COLLECTION);
  }

  async findByEmail(email: string) {
    return this.collection().findOne({ email });
  }

  async findById(id: string) {
    return this.collection().findOne({ _id: new ObjectId(id) } as any);
  }

  async findAll() {
    // não retornar senha
    return this.collection()
      .find({}, { projection: { senha: 0 } as any })
      .toArray();
  }

  async create(user: User) {
    const result = await this.collection().insertOne(user);
    return { ...user, _id: result.insertedId.toString() };
  }

  async deleteById(id: string) {
    const result = await this.collection().deleteOne({ _id: new ObjectId(id) } as any);
    return result.deletedCount === 1;
  }

  async setStatus(id: string, ativo: boolean) {
    const result = await this.collection().updateOne(
      { _id: new ObjectId(id) } as any,
      { $set: { ativo } }
    );
    return result.matchedCount === 1;
  }

  async setRole(id: string, role: UserRole) {
    const result = await this.collection().updateOne(
      { _id: new ObjectId(id) } as any,
      { $set: { role } }
    );
    return result.matchedCount === 1;
  }
}
