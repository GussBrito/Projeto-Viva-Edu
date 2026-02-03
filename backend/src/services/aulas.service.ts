import { AulaMongoRepository } from '../repositories/aula.mongo';
import { MateriaMongoRepository } from '../repositories/materia.mongo';
import { UserMongoRepository } from '../repositories/user.mongo';
import { Aula } from '../models/aula.model';
import { AgendamentoMongoRepository } from '../repositories/agendamentos.mongo';


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
            localId: data.localId,
            status: 'DISPONIVEL',
            createdAt: new Date()
        };

        return this.aulas.create(aula);
    }

    /**
     * Aulas disponíveis para ALUNO (retorno "limpo" pro front)
     * Inclui materiaNome e tutorNome.
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
        const materiaMap = new Map<string, string>(materias.map(m => [m._id!, (m as any).nome ?? (m as any).titulo ?? '']));

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

                dataHora: a.dataHora,
                localId: a.localId,

                status: String(a.status || 'DISPONIVEL'),
                createdAt: a.createdAt
            };
        });
    }

    async listMine(tutorId: string) {
        const aulas = await this.aulas.listByTutor(tutorId);

        // pega ids únicos
        const materiaIds = Array.from(
            new Set(aulas.map(a => a.materiaId).filter(Boolean))
        );

        // busca materias em lote
        const materias = await this.materias.findByIds(materiaIds);
        const materiaMap = new Map(materias.map(m => [m._id, (m as any).nome || m.nome]));

        // monta retorno "limpo"
        return aulas.map(a => ({
            ...a,
            materiaNome: materiaMap.get(a.materiaId) || a.materiaId
        }));
    }


    async update(id: string, tutorId: string, patch: Partial<Aula>) {
        // patch permitido
        const allowed: (keyof Aula)[] = ['titulo', 'descricao', 'dataHora', 'materiaId', 'status', 'localId'];
        const clean: Partial<Aula> = {};

        for (const k of allowed) {
            if (patch[k] !== undefined) (clean as any)[k] = patch[k];
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

        return this.aulas.findById(id);
    }

    async remove(id: string, tutorId: string) {
        const ok = await this.aulas.deleteById(id, tutorId);
        if (!ok) throw new Error('Aula não encontrada ou você não tem permissão');

        //apaga todos os agendamentos ligados a essa aula
        await this.agRepo.deleteByAulaId(id);

        return { deleted: true };
    }
}
