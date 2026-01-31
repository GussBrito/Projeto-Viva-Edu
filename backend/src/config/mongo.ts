import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('❌ MONGO_URI não definida no .env');
}

export const client = new MongoClient(uri);

export async function connectMongo() {
  try {
    await client.connect();
    console.log('✅ MongoDB conectado');
  } catch (err) {
    console.error('❌ Erro ao conectar no MongoDB', err);
    process.exit(1);
  }
}
