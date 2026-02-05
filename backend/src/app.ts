import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import path from 'path';
import tutorsRoutes from './routes/tutors.routes';
import materiasRoutes from './routes/materias.routes';
import aulasRoutes from './routes/aulas.routes';
import agendamentosRoutes from './routes/agendamentos.routes';
import relatoriosRoutes from "./routes/relatorios.routes";
import coordenadorRoutes from "./routes/coordenador.routes";

const app = express();

app.use(cors({
    origin: true, 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/tutors', tutorsRoutes);
app.use('/materias', materiasRoutes);
app.use('/aulas', aulasRoutes);
app.use(agendamentosRoutes);
app.use(relatoriosRoutes);
app.use(relatoriosRoutes);
app.use(coordenadorRoutes);

//servir arquivos (pra abrir no navegador)
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));


export default app;
