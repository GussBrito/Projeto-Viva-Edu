# 📚 VivaEdu — Plataforma de Apoio Educacional

O **VivaEdu** é um sistema acadêmico criado para conectar **alunos, voluntários e escolas públicas**, automatizando processos como cadastro, validação de tutores, criação e agendamento de aulas, envio de relatórios e visualização geográfica dos encontros.

O objetivo é **organizar o reforço escolar** e ampliar o acesso dos estudantes a atividades complementares de forma segura e acessível.

---

## 🧱 Arquitetura

O backend segue uma arquitetura em camadas:

controllers/ -> Rotas e validações HTTP
services/ -> Regras de negócio
repositories/ -> Acesso aos bancos (MongoDB / Neo4j)
models/ -> Tipagens
routes/ -> Definição das rotas
middlewares/ -> Autenticação e autorização
config/ -> Configurações

O frontend é separado por perfil:

aluno-* | tutor-* | coordenador-* | admin-*


---

## 🛠️ Tecnologias

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- Neo4j
- JWT
- Multer

### Frontend
- HTML, CSS, JavaScript
- Leaflet.js
- OpenStreetMap

---

## 🌍 Localização

Cada aula possui local com padrão **GeoJSON**, escolhido em mapa interativo:

json
{
  "type": "Point",
  "coordinates": [-38.5616, -6.8896]
}
Alunos, tutores e coordenadores podem abrir o local pelo botão “Ver no mapa”.

## ▶️ Como Rodar
Pré-requisitos

- Node.js

- MongoDB

- Neo4j

- Instalar dependências
```
npm install
```
- Configurar .env
```
PORT=3000

MONGO_URI=mongodb://localhost:27017/vivaedu

NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=senha

JWT_SECRET=supersecret
```
- Rodar backend
```
npm run dev
```
## 👥 Perfis

Aluno: agenda aulas e vê locais.

Tutor: cria aulas, envia documentos e relatórios.

Coordenador: valida tutores e vê relatórios.

Admin: gerencia usuários.

📋 Recursos Implementados

✔️ Autenticação JWT
✔️ Controle por perfil
✔️ Grafo de relacionamentos
✔️ Geolocalização
✔️ Upload de arquivos
✔️ Visualização em mapa
✔️ CRUD completo