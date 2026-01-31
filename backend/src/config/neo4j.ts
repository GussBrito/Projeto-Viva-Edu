import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

if (!uri || !user || !password) {
  throw new Error('❌ Variáveis do Neo4j não definidas no .env');
}

export const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(user, password)
);

export async function connectNeo4j() {
  try {
    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();
    console.log('✅ Neo4j conectado');
  } catch (error) {
    console.error('❌ Erro ao conectar no Neo4j', error);
    process.exit(1);
  }
}
