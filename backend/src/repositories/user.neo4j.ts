import { driver } from '../config/neo4j';

export class UserNeo4jRepository {

  async createUserNode(idMongo: string, nome: string, role: string) {
    const session = driver.session();

    try {
      await session.run(
        `
        CREATE (u:User {
          idMongo: $idMongo,
          nome: $nome,
          role: $role,
          createdAt: datetime()
        })
        `,
        { idMongo, nome, role }
      );
    } finally {
      await session.close();
    }
  }

  //remove usuário no grafo pelo id do Mongo
  async deleteUserNode(idMongo: string) {
    const session = driver.session();

    try {
      await session.run(
        `
        MATCH (u:User { idMongo: $idMongo })
        DETACH DELETE u
        `,
        { idMongo }
      );
    } finally {
      await session.close();
    }
  }
}
