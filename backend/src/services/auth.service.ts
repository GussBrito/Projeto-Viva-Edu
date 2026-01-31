import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserMongoRepository } from '../repositories/user.mongo';
import { UserNeo4jRepository } from '../repositories/user.neo4j';
import { User } from '../models/user.model';

export class AuthService {
    private userRepo = new UserMongoRepository();
    private userGraph = new UserNeo4jRepository();

    async register(data: User) {
        const existing = await this.userRepo.findByEmail(data.email);
        if (existing) {
            throw new Error('Email já cadastrado');
        }

        const hash = await bcrypt.hash(data.senha, 10);

        const user: User = {
            ...data,
            senha: hash,
            createdAt: new Date()
        };

        // 1) salva no Mongo
        const created = await this.userRepo.create(user);

        // 2) salva o nó no Neo4j
        await this.userGraph.createUserNode(
            created._id!, // idMongo
            created.nome,
            created.role
        );

        return created;

    }

    async login(email: string, senha: string) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new Error('Email ou senha inválidos');
        }

        const ok = await bcrypt.compare(senha, user.senha);
        if (!ok) {
            throw new Error('Email ou senha inválidos');
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        return {
            token,
            nome: user.nome,
            role: user.role
        };

    }
}
