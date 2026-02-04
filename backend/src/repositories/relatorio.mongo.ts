import { ObjectId } from "mongodb";
import { client } from "../config/mongo";
import { Relatorio } from "../models/relatorio.model";

const COLLECTION = "relatorios";

export class RelatorioMongoRepository {
  private collection() {
    return client.db().collection<Relatorio>(COLLECTION);
  }

  async create(doc: Relatorio) {
    const result = await this.collection().insertOne(doc as any);

    // ✅ retorna o documento com _id (string) para o service usar no Neo4j
    return { ...doc, _id: result.insertedId.toString() } as any;
  }

  async findByAulaId(aulaId: string) {
    return this.collection()
      .find({ aulaId } as any)
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findLatestByAulaId(aulaId: string) {
    return this.collection()
      .find({ aulaId } as any)
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray()
      .then(arr => arr[0] || null);
  }

  async deleteByAulaId(aulaId: string) {
    const result = await this.collection().deleteMany({ aulaId } as any);
    return result.deletedCount;
  }

  async listAll() {
    return this.collection()
      .find({} as any)
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findById(id: string) {
    return this.collection().findOne({ _id: new ObjectId(id) } as any);
  }
}
