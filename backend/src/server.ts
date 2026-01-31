import app from './app';
import { connectMongo } from './config/mongo';
import { connectNeo4j } from './config/neo4j';

const PORT = 3000;

async function start() {
    await connectMongo();
    await connectNeo4j();

    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}

start();
