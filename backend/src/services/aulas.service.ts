import { AulaMongoRepository } from '../repositories/aula.mongo';
import { MateriaMongoRepository } from '../repositories/materia.mongo';
import { UserMongoRepository } from '../repositories/user.mongo';
import { Aula } from '../models/aula.model';
import { AgendamentoMongoRepository } from '../repositories/agendamentos.mongo';
import { UserNeo4jRepository } from '../repositories/user.neo4j';

type AulaView = {
    _id: string;
    tutorId: string;
    tutorNome: string;
    tutor: { id: string; nome: string };

    materiaId: string;
    materiaNome: string;

    titulo: string;
    descricao?: string;

    dataHora: string;
    localId?: string;

    status: string;
    createdAt?: Date;
};

export class AulasService {
    private aulas = new AulaMongoRepository();
    private materias = new MateriaMongoRepository();
    private users = new UserMongoRepository();
    private agRepo = new AgendamentoMongoRepository();
    private graph = new UserNeo4jRepository();

    /** garante que localId seja sempre string JSON (pra não quebrar JSON.parse no front) */
    private normalizeLocalId(value: any): string | undefined {
        if (value === undefined || value === null) return undefined;
        if (typeof value === 'string') return value;

        // se chegou como objeto, converte pra string JSON
        try {
            return JSON.stringify(value);
        } catch {
            return undefined;
        }
    }

    private async assertTutorValidado(tutorId: string) {
        const tutor = await this.users.findById(tutorId);
        if (!tutor) throw new Error('Usuário não encontrado');
        if (tutor.role !== 'TUTOR') throw new Error('Apenas TUTOR');
        if ((tutor as any).ativo === false) throw new Error('Usuário desativado');

        // RN01: voluntário precisa ser validado antes de oferecer aulas
        if ((tutor as any).tutorValidado !== true) {
            throw new Error('Tutor ainda não validado');
        }
    }

    async create(tutorId: string, data: Partial<Aula>) {
        await this.assertTutorValidado(tutorId);

        const { materiaId, titulo, descricao, dataHora } = data;

        if (!materiaId || !titulo || !descricao || !dataHora) {
            throw new Error('Campos obrigatórios: materiaId, titulo, descricao, dataHora');
        }

        const materia = await this.materias.findById(materiaId);
        if (!materia) throw new Error('Matéria não encontrada');
        if ((materia as any).ativo === false) throw new Error('Matéria inativa');

        // valida data
        const dt = new Date(String(dataHora));
        if (isNaN(dt.getTime())) throw new Error('dataHora inválida');

        const aula: Aula = {
            tutorId,
            materiaId,
            titulo: String(titulo).trim(),
            descricao: String(descricao).trim(),
            dataHora: dt.toISOString(),

            // ✅ garante string JSON
            localId: this.normalizeLocalId((data as any).localId),

            status: 'DISPONIVEL',
            createdAt: new Date()
        };

        // salva no Mongo
        const created = await this.aulas.create(aula);

        // salva no Neo4j: Aula + Tutor-OFERECE->Aula
        await this.graph.createAulaNode(created._id!, created.titulo);
        await this.graph.createTutorOfereceAula(tutorId, created._id!);

        return created;
    }

    /**
     * Aulas disponíveis para ALUNO (retorno "limpo" pro front)
     * Inclui materiaNome, tutorNome, dataHora e localId.
     */
    async listAvailable(): Promise<AulaView[]> {
        const aulas = await this.aulas.listAvailable();

        const tutorIds = [...new Set(aulas.map(a => a.tutorId).filter(Boolean))];
        const materiaIds = [...new Set(aulas.map(a => a.materiaId).filter(Boolean))];

        const [tutores, materias] = await Promise.all([
            this.users.findPublicByIds(tutorIds),
            this.materias.findByIds(materiaIds)
        ]);

        const tutorMap = new Map<string, string>(tutores.map(t => [t._id!, t.nome]));
        const materiaMap = new Map<string, string>(
            materias.map(m => [m._id!, (m as any).nome ?? (m as any).titulo ?? ''])
        );

        return aulas.map(a => {
            const tutorNome = tutorMap.get(a.tutorId) || 'Tutor';
            const materiaNome = materiaMap.get(a.materiaId) || a.materiaId;

            return {
                _id: a._id!,
                tutorId: a.tutorId,
                tutorNome,
                tutor: { id: a.tutorId, nome: tutorNome },

                materiaId: a.materiaId,
                materiaNome,

                titulo: a.titulo,
                descricao: a.descricao,

                // garante string ISO
                dataHora: String(a.dataHora || ''),

                // garante string JSON (mesmo se veio do mongo como objeto)
                localId: this.normalizeLocalId((a as any).localId),

                status: String(a.status || 'DISPONIVEL'),
                createdAt: a.createdAt
            };
        });
    }

    async listMine(tutorId: string) {
        const aulas = await this.aulas.listByTutor(tutorId);

        // ===== materiaNome =====
        const materiaIds = Array.from(new Set(aulas.map(a => a.materiaId).filter(Boolean)));
        const materias = await this.materias.findByIds(materiaIds);
        const materiaMap = new Map(
            materias.map(m => [String((m as any)._id), (m as any).nome || (m as any).titulo || ""])
        );

        // ===== alunos confirmados =====
        const aulaIds = aulas.map(a => String(a._id)).filter(Boolean);
        const agsConfirmados = await this.agRepo.findConfirmedByAulaIds(aulaIds);

        const alunoIds = Array.from(
            new Set((agsConfirmados || []).map((ag: any) => String(ag.alunoId)).filter(Boolean))
        );

        const alunosPublic = await this.users.findPublicByIds(alunoIds);
        const alunoNomeById = new Map(alunosPublic.map((u: any) => [String(u._id), u.nome]));

        // agrupa por aulaId
        const alunosPorAula = new Map<string, { id: string; nome: string }[]>();
        for (const ag of (agsConfirmados || []) as any[]) {
            const aulaId = String(ag.aulaId);
            const alunoId = String(ag.alunoId);

            const arr = alunosPorAula.get(aulaId) || [];
            arr.push({
                id: alunoId,
                nome: alunoNomeById.get(alunoId) || "Aluno"
            });
            alunosPorAula.set(aulaId, arr);
        }

        // retorno final
        return aulas.map(a => {
            const id = String(a._id);
            return {
                ...a,
                // garante localId string no retorno pro front
                localId: this.normalizeLocalId((a as any).localId),

                materiaNome: materiaMap.get(String(a.materiaId)) || a.materiaId,
                alunosMatriculados: alunosPorAula.get(id) || []
            };
        });
    }

    async update(id: string, tutorId: string, patch: Partial<Aula>) {
        const allowed: (keyof Aula)[] = ['titulo', 'descricao', 'dataHora', 'materiaId', 'status', 'localId'];
        const clean: Partial<Aula> = {};

        for (const k of allowed) {
            if (patch[k] !== undefined) (clean as any)[k] = patch[k];
        }

        // ✅ normaliza localId se veio como objeto
        if ((clean as any).localId !== undefined) {
            (clean as any).localId = this.normalizeLocalId((clean as any).localId);
        }

        if (clean.materiaId) {
            const materia = await this.materias.findById(String(clean.materiaId));
            if (!materia) throw new Error('Matéria não encontrada');
            if ((materia as any).ativo === false) throw new Error('Matéria inativa');
        }

        if (clean.dataHora) {
            const dt = new Date(String(clean.dataHora));
            if (isNaN(dt.getTime())) throw new Error('dataHora inválida');
            clean.dataHora = dt.toISOString();
        }

        const ok = await this.aulas.updateById(id, tutorId, clean);
        if (!ok) throw new Error('Aula não encontrada ou você não tem permissão');

        const updated = await this.aulas.findById(id);

        // manter Neo4j coerente (atualiza título se mudou)
        if (updated && clean.titulo) {
            await this.graph.createAulaNode(updated._id!, updated.titulo);
        }

        return updated;
    }

    async remove(id: string, tutorId: string) {
        const ok = await this.aulas.deleteById(id, tutorId);
        if (!ok) throw new Error('Aula não encontrada ou você não tem permissão');

        await this.agRepo.deleteByAulaId(id);
        await this.graph.deleteAulaNode(id);

        return { deleted: true };
    }
}
