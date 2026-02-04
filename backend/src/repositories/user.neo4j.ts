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

  // ===== COORDENADOR VALIDA TUTOR =====
  async createCoordenadorValidaTutor(coordId: string, tutorId: string, validado: boolean) {
    return this.run(
      `
      MATCH (c:User { idMongo: $coordId })
      MATCH (t:User { idMongo: $tutorId })
      MERGE (c)-[r:VALIDA_TUTOR]->(t)
      SET r.validado = $validado,
          r.at = datetime()
      `,
      { coordId, tutorId, validado }
    );
  }

  // ===== RELATÓRIO NO GRAFO =====

  // cria/atualiza nó Relatorio
  async createRelatorioNode(relatorioId: string, arquivoUrl: string, createdAtISO?: string) {
    return this.run(
      `
      MERGE (r:Relatorio { idMongo: $relatorioId })
      SET r.arquivoUrl = $arquivoUrl,
          r.updatedAt = datetime()
      ON CREATE SET r.createdAt = CASE
        WHEN $createdAtISO IS NULL THEN datetime()
        ELSE datetime($createdAtISO)
      END
      `,
      { relatorioId, arquivoUrl, createdAtISO: createdAtISO || null }
    );
  }

  // Tutor -> GERA_RELATORIO -> Relatorio
  async linkTutorGeraRelatorio(tutorId: string, relatorioId: string) {
    return this.run(
      `
      MATCH (t:User { idMongo: $tutorId })
      MATCH (r:Relatorio { idMongo: $relatorioId })
      MERGE (t)-[x:GERA_RELATORIO]->(r)
      SET x.at = datetime()
      `,
      { tutorId, relatorioId }
    );
  }

  // Relatorio -> RELATORIO_DA -> Aula
  async linkRelatorioDaAula(relatorioId: string, aulaId: string) {
    return this.run(
      `
      MATCH (r:Relatorio { idMongo: $relatorioId })
      MATCH (a:Aula { idMongo: $aulaId })
      MERGE (r)-[:RELATORIO_DA]->(a)
      `,
      { relatorioId, aulaId }
    );
  }

  async deleteRelatorioNode(relatorioId: string) {
    return this.run(
      `
      MATCH (r:Relatorio { idMongo: $relatorioId })
      DETACH DELETE r
      `,
      { relatorioId }
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
