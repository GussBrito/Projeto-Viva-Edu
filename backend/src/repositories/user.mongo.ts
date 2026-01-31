import { ObjectId } from 'mongodb';
import { client } from '../config/mongo';
import { User } from '../models/user.model';

const COLLECTION = 'users';

export class UserMongoRepository {
  private collection() {
    return client.db().collection<User>(COLLECTION);
  }

  async findByEmail(email: string) {
    return this.collection().findOne({ email });
  }

  async create(user: User) {
    const result = await this.collection().insertOne(user);
    return { ...user, _id: result.insertedId.toString() };
  }
}
