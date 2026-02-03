import { ObjectId } from 'mongodb';
import { client } from '../config/mongo';
import { Agendamento, AgendamentoStatus } from '../models/agendamento.model';

const COLLECTION = 'agendamentos';

export class AgendamentoMongoRepository {
    private collection() {
        return client.db().collection<Agendamento>(COLLECTION);
    }

    private toStringId(doc: any) {
        if (!doc) return doc;
        return { ...doc, _id: String(doc._id) };
    }

    async create(doc: Agendamento) {
        const result = await this.collection().insertOne(doc);
        return { ...doc, _id: result.insertedId.toString() };
    }

    async findPendingByAulaAndAluno(aulaId: string, alunoId: string) {
        const doc = await this.collection().findOne({
            aulaId,
            alunoId,
            status: { $in: ['PENDENTE', 'CONFIRMADO'] }
        } as any);
        return this.toStringId(doc);
    }

    async findByAluno(alunoId: string) {
        const docs = await this.collection().find({ alunoId } as any).toArray();
        return docs.map(d => this.toStringId(d));
    }

    async findByTutor(tutorId: string) {
        const docs = await this.collection().find({ tutorId } as any).toArray();
        return docs.map(d => this.toStringId(d));
    }

    async findById(id: string) {
        const doc = await this.collection().findOne({ _id: new ObjectId(id) } as any);
        return this.toStringId(doc);
    }

    async setStatus(id: string, status: AgendamentoStatus) {
        const result = await this.collection().updateOne(
            { _id: new ObjectId(id) } as any,
            { $set: { status } }
        );
        return result.matchedCount === 1;
    }

    async deleteById(id: string) {
        const result = await this.collection().deleteOne({ _id: new ObjectId(id) } as any);
        return result.deletedCount === 1;
    }

    // agendamentos.mongo.ts
    async deleteByAulaId(aulaId: string) {
        const result = await this.collection().deleteMany({ aulaId } as any);
        return result.deletedCount; // quantos apagou
    }

}
