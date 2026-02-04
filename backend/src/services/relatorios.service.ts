import { AulaMongoRepository } from "../repositories/aula.mongo";
import { AgendamentoMongoRepository } from "../repositories/agendamentos.mongo";
import { RelatorioMongoRepository } from "../repositories/relatorio.mongo";
import { Relatorio } from "../models/relatorio.model";
import { MateriaMongoRepository } from "../repositories/materia.mongo";
import { UserMongoRepository } from "../repositories/user.mongo";
import { UserNeo4jRepository } from "../repositories/user.neo4j";

type RelatorioListView = {
  _id: string;
  aulaId: string;
  materiaNome: string;
  tituloAula: string;
  tutorNome: string;
  createdAt: Date;
  arquivoUrl: string;
};

export class RelatoriosService {
  private aulas = new AulaMongoRepository();
  private agRepo = new AgendamentoMongoRepository();
  private relRepo = new RelatorioMongoRepository();
  private materias = new MateriaMongoRepository();
  private users = new UserMongoRepository();
  private graph = new UserNeo4jRepository();

  async createRelatorioForAula(
    tutorId: string,
    aulaId: string,
    payload: { observacoes?: string; arquivoUrl?: string; arquivoNome?: string; arquivoMime?: string }
  ) {
    const aula = await this.aulas.findById(aulaId);
    if (!aula) throw new Error("Aula não encontrada");

    if (aula.tutorId !== tutorId) {
      throw new Error("Acesso negado: aula não pertence a este tutor");
    }

    // regra: só permitir relatório se houver pelo menos 1 agendamento CONFIRMADO
    const confirmados = await (this.agRepo as any).findConfirmedByAulaIds?.([aulaId]);
    if (Array.isArray(confirmados) && confirmados.length === 0) {
      throw new Error("Só é possível enviar relatório após ter aluno CONFIRMADO");
    }

    const doc: Relatorio = {
      aulaId,
      tutorId,
      observacoes: payload.observacoes?.trim() || "",
      arquivoUrl: payload.arquivoUrl,
      arquivoNome: payload.arquivoNome,
      arquivoMime: payload.arquivoMime,
      createdAt: new Date()
    };

    const created = await this.relRepo.create(doc);

    // recomendado: marca aula como FINALIZADA
    await this.aulas.updateById(aulaId, tutorId, { status: "FINALIZADA" } as any);

    // ✅ Neo4j: cria nó Relatorio + liga Tutor -> Relatorio -> Aula
    // pressupõe que (:Aula {idMongo:aulaId}) já existe
    try {
      if ((created as any)?._id && (created as any).arquivoUrl) {
        const relatorioId = String((created as any)._id);
        const arquivoUrl = String((created as any).arquivoUrl);

        const createdAtISO =
          (created as any).createdAt ? new Date((created as any).createdAt).toISOString() : undefined;

        await this.graph.createRelatorioNode(relatorioId, arquivoUrl, createdAtISO);
        await this.graph.linkTutorGeraRelatorio(tutorId, relatorioId);
        await this.graph.linkRelatorioDaAula(relatorioId, aulaId);
      }
    } catch (e) {
      // se Neo4j falhar, não impede o fluxo principal (Mongo já salvou)
      console.warn("Neo4j (relatorio) falhou:", (e as any)?.message || e);
    }

    return created;
  }

  async listByAula(aulaId: string) {
    return this.relRepo.findByAulaId(aulaId);
  }

  /**
   * ✅ LISTAR RELATÓRIOS (COORDENADOR)
   * Retorna "limpo" pro front:
   * _id, aulaId, materiaNome, tituloAula, tutorNome, createdAt, arquivoUrl
   */
  async listAllForCoordenador(): Promise<RelatorioListView[]> {
    // tenta listAll() e depois fallback findAll()
    let relatorios: any[] = [];

    const anyRepo = this.relRepo as any;

    if (typeof anyRepo.listAll === "function") {
      const r = await anyRepo.listAll();
      relatorios = Array.isArray(r) ? r : [];
    } else if (typeof anyRepo.findAll === "function") {
      const r = await anyRepo.findAll();
      relatorios = Array.isArray(r) ? r : [];
    } else {
      // se não existir nenhum, avisa claramente (melhor do que "undefined is not a function")
      throw new Error("RelatorioMongoRepository precisa ter listAll() ou findAll()");
    }

    const aulaIds = [...new Set(relatorios.map(r => r.aulaId).filter(Boolean))];

    // busca aulas em lote (se existir findByIds), senão faz findById em paralelo
    let aulas: any[] = [];
    const anyAulasRepo = this.aulas as any;

    if (typeof anyAulasRepo.findByIds === "function") {
      const r = await anyAulasRepo.findByIds(aulaIds);
      aulas = Array.isArray(r) ? r : [];
    } else {
      const results = await Promise.all(aulaIds.map(id => this.aulas.findById(id)));
      aulas = results.filter(Boolean);
    }

    const aulaMap = new Map(aulas.map(a => [String(a._id), a]));

    const tutorIds = [...new Set(relatorios.map(r => r.tutorId).filter(Boolean))];
    const materiaIds = [...new Set(aulas.map(a => a.materiaId).filter(Boolean))];

    const [tutores, materias] = await Promise.all([
      this.users.findPublicByIds(tutorIds),
      this.materias.findByIds(materiaIds)
    ]);

    const tutorMap = new Map((tutores || []).map((t: any) => [String(t._id), t.nome]));
    const materiaMap = new Map((materias || []).map((m: any) => [String(m._id), m.nome]));

    return relatorios.map((r: any) => {
      const aula = aulaMap.get(String(r.aulaId));

      const tituloAula = aula?.titulo || "[Aula removida]";
      const materiaNome = aula ? (materiaMap.get(String(aula.materiaId)) || "Matéria") : "";
      const tutorNome = tutorMap.get(String(r.tutorId)) || "Tutor";

      // arquivoUrl (prioriza o que já está no banco)
      let arquivoUrl = String(r.arquivoUrl || "").trim();

      if (!arquivoUrl && r.arquivoNome) {
        arquivoUrl = `/uploads/relatorios/${String(r.arquivoNome)}`;
      }

      if (!arquivoUrl && r.arquivoPath) {
        arquivoUrl =
          "/" +
          String(r.arquivoPath)
            .replace(/\\/g, "/")
            .replace(/^\/+/, "");
      }

      const createdAt = r.createdAt ? new Date(r.createdAt) : new Date();

      return {
        _id: String(r._id),
        aulaId: String(r.aulaId),
        materiaNome,
        tituloAula,
        tutorNome,
        createdAt,
        arquivoUrl
      };
    });
  }
}
