import { ObjectId } from 'mongodb';
import { client } from '../config/mongo';
import { Agendamento, AgendamentoStatus } from '../models/agendamento.model';

const COLLECTION = 'agendamentos';

export class AgendamentoMongoRepository {
  private collection() {
    return client.db().collection<Agendamento>(COLLECTION);
  }

  async create(doc: Agendamento) {
    const result = await this.collection().insertOne(doc);
    return { ...doc, _id: result.insertedId.toString() };
  }

  async findPendingByAulaAndAluno(aulaId: string, alunoId: string) {
    return this.collection().findOne({
      aulaId,
      alunoId,
      status: { $in: ['PENDENTE', 'CONFIRMADO'] }
    } as any);
  }

  async findByAluno(alunoId: string) {
    return this.collection().find({ alunoId } as any).toArray();
  }

  // ✅ NOVO: listar agendamentos do tutor
  async findByTutor(tutorId: string) {
    return this.collection().find({ tutorId } as any).toArray();
  }

  // ✅ NOVO: buscar por id (pra validar dono)
  async findById(id: string) {
    return this.collection().findOne({ _id: new ObjectId(id) } as any);
  }

  // ✅ NOVO: atualizar status
  async setStatus(id: string, status: AgendamentoStatus) {
    const result = await this.collection().updateOne(
      { _id: new ObjectId(id) } as any,
      { $set: { status } }
    );
    return result.matchedCount === 1;
  }
}
