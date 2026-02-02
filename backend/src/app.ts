import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import path from 'path';
import tutorsRoutes from './routes/tutors.routes';

const app = express();

app.use(cors({
    origin: true, // libera o origin que está chamando (ok pra projeto acadêmico)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/tutors', tutorsRoutes);

//servir arquivos (pra abrir no navegador)
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));


export default app;
