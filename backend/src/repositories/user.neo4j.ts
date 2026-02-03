import { driver } from '../config/neo4j';

export class UserNeo4jRepository {

  // helper
  private async run(query: string, params: Record<string, any>) {
    const session = driver.session();
    try {
      return await session.run(query, params);
    } finally {
      await session.close();
    }
  }

  // ======================
  // USERS
  // ======================

  async createUserNode(idMongo: string, nome: string, role: string) {
    return this.run(
      `
      MERGE (u:User { idMongo: $idMongo })
      SET u.nome = $nome,
          u.role = $role,
          u.createdAt = datetime()
      `,
      { idMongo, nome, role }
    );
  }

  async deleteUserNode(idMongo: string) {
    return this.run(
      `
      MATCH (u:User { idMongo: $idMongo })
      DETACH DELETE u
      `,
      { idMongo }
    );
  }

  // ======================
  // AULAS
  // ======================

  async createAulaNode(aulaId: string, titulo: string) {
    return this.run(
      `
      MERGE (a:Aula { idMongo: $aulaId })
      SET a.titulo = $titulo,
          a.createdAt = datetime()
      `,
      { aulaId, titulo }
    );
  }

  async deleteAulaNode(aulaId: string) {
    return this.run(
      `
      MATCH (a:Aula { idMongo: $aulaId })
      DETACH DELETE a
      `,
      { aulaId }
    );
  }

  // ======================
  // RELACIONAMENTOS
  // ======================

  // Tutor -> OFERECE -> Aula
  async createTutorOfereceAula(tutorId: string, aulaId: string) {
    return this.run(
      `
      MATCH (t:User { idMongo: $tutorId })
      MATCH (a:Aula { idMongo: $aulaId })
      MERGE (t)-[:OFERECE]->(a)
      `,
      { tutorId, aulaId }
    );
  }

  // Aluno -> AGENDA -> Aula
  async createAlunoAgendaAula(alunoId: string, aulaId: string, status: string) {
    return this.run(
      `
      MATCH (al:User { idMongo: $alunoId })
      MATCH (a:Aula { idMongo: $aulaId })
      MERGE (al)-[r:AGENDA]->(a)
      SET r.status = $status,
          r.createdAt = coalesce(r.createdAt, datetime()),
          r.updatedAt = datetime()
      `,
      { alunoId, aulaId, status }
    );
  }

  // ===== NOMES PADRÃO (para bater com o service) =====

  // usado no AgendamentosService
  async updateAlunoAgendaStatus(alunoId: string, aulaId: string, status: string) {
    return this.run(
      `
      MATCH (al:User { idMongo: $alunoId })-[r:AGENDA]->(a:Aula { idMongo: $aulaId })
      SET r.status = $status,
          r.updatedAt = datetime()
      `,
      { alunoId, aulaId, status }
    );
  }

  // usado no AgendamentosService
  async deleteAlunoAgendaAula(alunoId: string, aulaId: string) {
    return this.run(
      `
      MATCH (al:User { idMongo: $alunoId })-[r:AGENDA]->(a:Aula { idMongo: $aulaId })
      DELETE r
      `,
      { alunoId, aulaId }
    );
  }

  // ===== Mantém seus nomes antigos (backward compatibility) =====
  async updateAgendaStatus(alunoId: string, aulaId: string, status: string) {
    return this.updateAlunoAgendaStatus(alunoId, aulaId, status);
  }

  async deleteAgendaRelation(alunoId: string, aulaId: string) {
    return this.deleteAlunoAgendaAula(alunoId, aulaId);
  }
}
