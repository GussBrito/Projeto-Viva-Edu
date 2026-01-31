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
}
