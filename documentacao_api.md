# 📚 VivaEdu – Documentação da API

O VivaEdu é uma plataforma para conectar escolas públicas, alunos, tutores voluntários e coordenadores, permitindo o cadastro de usuários, agendamento de aulas, envio de relatórios e acompanhamento pedagógico.

Esta documentação descreve as principais rotas do backend.

---

## 🔐 Autenticação

### POST /auth/login

Realiza login.

**Body:**
```json
{
  "email": "user@email.com",
  "senha": "123456"
}
```

**Resposta:**
```json
{
  "token": "...",
  "user": {
    "id": "...",
    "nome": "...",
    "role": "TUTOR"
  }
}
```

---

## 👤 Usuários

### GET /users/me

Retorna dados do usuário autenticado.

**Auth:** Bearer Token

---

---

## 📘 Aulas

### POST /aulas

Cria aula (Tutor).

**Auth:** TUTOR

**Body:**
```json
{
  "materiaId": "...",
  "titulo": "Equações",
  "descricao": "Revisão",
  "dataHora": "2026-02-10T18:00:00Z",
  "localId": "{...}"
}
```

---

### GET /aulas

Lista aulas disponíveis (Aluno).

---

### GET /aulas/mine

Lista aulas do tutor.

---

### PUT /aulas/:id

Atualiza aula.

---

### DELETE /aulas/:id

Remove aula.

---

---

## 📅 Agendamentos

### POST /agendamentos

Aluno agenda aula.

```json
{
  "aulaId": "..."
}
```

---

### GET /agendamentos/mine

Lista agendamentos do aluno.

---

### PUT /agendamentos/:id/status

Tutor confirma ou rejeita.

---

---

## 📝 Relatórios

### POST /aulas/:id/relatorio

Tutor envia relatório.

**FormData:**
- observacoes
- arquivo

---

### GET /relatorios

(Coordenador) Lista relatórios.

---

---

## 🎓 Coordenador

### GET /coordenador/alunos

Lista alunos.

---

### GET /coordenador/tutores

Lista tutores.

---

### GET /coordenador/aulas

Lista aulas.

---

---

## 🧠 Neo4j – Grafo

O sistema mantém um grafo com:

- (:User)
- (:Aula)
- (:Relatorio)

Relacionamentos:

- (Tutor)-[:OFERECE]->(Aula)
- (Aluno)-[:AGENDA]->(Aula)
- (Coordenador)-[:VALIDA_TUTOR]->(Tutor)
- (Tutor)-[:GERA_RELATORIO]->(Relatorio)
- (Relatorio)-[:RELATORIO_DA]->(Aula)

---

## 🌍 Geolocalização

As aulas possuem localização salva em formato GeoJSON:

```json
{
  "geo": {
    "type": "Point",
    "coordinates": [-38.5616, -6.8896]
  }
}
```

Esse formato permite consultas espaciais futuras.

---

## 🔒 Segurança

Todas as rotas usam JWT via header:

```
Authorization: Bearer TOKEN
```

Middleware controla permissões por role:

- ALUNO
- TUTOR
- COORDENADOR
- ADMIN

---

## 🚀 Tecnologias usadas

- Node.js
- Express
- TypeScript
- MongoDB
- Neo4j
- JWT
- Multer
- Leaflet (mapas)
