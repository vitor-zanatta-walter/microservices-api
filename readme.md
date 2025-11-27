# Documentação da API (Via API Gateway)

Este documento descreve as rotas disponíveis no sistema, acessíveis através do **API Gateway (Proxy)**.

**Base URL do Gateway:** `http://IP`

## Autenticação
quase todas rotas requerem um token JWT no header `Authorization`.\
**Formato:** `Authorization: Bearer <token>`

---

#### `POST /api/login`
**Descrição:** Valida credenciais (Login) e retorna Token JWT.\
**Auth:** Não requer.\
**Request Body:**
```json
{
  "email": "joao@example.com",
  "password": "senha_segura"
}
```
**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": "1d"
}
```

---


<br>

## 1. Serviço de Usuários
**Prefixo:** `/api/users`


### Rotas Públicas

#### `GET /ping`
**Descrição:** Verifica se o serviço está online.
**Auth:** Não requer.
**Response (200 OK):**
```text
pong
```

---

#### `POST /`
**Descrição:** Cria um novo usuário (Cadastro).\
**Auth:** Não requer.\
**Request Body:**
```json
{
  "name": "João Silva",
  "cpf": "123.456.789-00",
  "email": "joao@example.com",
  "password": "senha_segura"
}
```
**Response (201 Created):**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "is_attendant": 0
}
```

---



#### `POST /internal/create_attendant`
**Descrição:** Rota de desenvolvimento para criar um atendente.\
**Auth:** Não requer.\
**Request Body:**
```json
{
  "name": "Admin",
  "cpf": "000.000.000-00",
  "email": "admin@example.com",
  "password": "admin"
}
```
**Response (201 Created):**
```json
{
  "id": 2,
  "name": "Admin",
  "email": "admin@example.com",
  "is_attendant": 1
}
```

### Rotas Protegidas (Requer Token)

#### `GET /me`
**Descrição:** Retorna os dados do usuário autenticado.\
**Auth:** Requer Token.\
**Response (200 OK):**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "is_attendant": 0
}
```

---

#### `GET /email/:email`
**Descrição:** Busca usuário por email (Apenas atendentes).\
**Auth:** Requer Token (Atendente).\
**Response (200 OK):**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "is_attendant": 0
}
```

---

#### `POST /promote/:user_id`
**Descrição:** Promove um usuário a atendente.\
**Auth:** Requer Token (Atendente).\
**Response (204 No Content):** *Sem corpo*

---

#### `POST /demote/:user_id`
**Descrição:** Remove privilégios de atendente.
**Auth:** Requer Token (Atendente).\
**Response (204 No Content):** *Sem corpo*

---

#### `GET /:user_id`
**Descrição:** Busca usuário por ID.\
**Auth:** Requer Token (Próprio usuário ou Atendente).\
**Response (200 OK):**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "is_attendant": 0
}
```

---

#### `PUT /:user_id`
**Descrição:** Atualiza dados do usuário.\
**Auth:** Requer Token (Próprio usuário ou Atendente).\
**Request Body:**
```json
{
  "name": "João da Silva",
  "email": "novoemail@example.com"
}
```
**Response (200 OK):**
```json
{
  "id": 1,
  "name": "João da Silva",
  "email": "novoemail@example.com",
  "is_attendant": 0
}
```

---

#### `DELETE /:user_id`
**Descrição:** Deleta um usuário.\
**Auth:** Requer Token (Próprio usuário).\
**Response (204 No Content):** *Sem corpo*

---

<br>

## 2. Serviço de Inscrições
**Prefixo:** `/api/enrollments`

### Rotas Protegidas

#### `POST /`
**Descrição:** Cria uma nova inscrição.\
**Auth:** Requer Token.\
**Request Body:**
```json
{
  "user_id": 1,
  "event_id": 10,
  "source": "web"
}
```
**Response (201 Created):**
```json
{
  "event_id": 10,
  "source": "web",
  "user_id": 1,
  "status": "pending"
}
```

---

#### `GET /me`
**Descrição:** Busca todas as inscrições do usuário autenticado.\
**Auth:** Requer Token.\
**Response (200 OK):**
```json
[
  {
    "user_id": 1,
    "event_id": 10,
    "status": "pending",
    "created_at": "2025-11-26T10:00:00.000Z",
    "checkin_time": null,
    "source": "web"
  }
]
```

---

#### `GET /events/:event_id`
**Descrição:** Busca todas as inscrições de um evento.\
**Auth:** Requer Token.\
**Response (200 OK):**
```json
[
  {
    "user_id": 1,
    "event_id": 10,
    "status": "pending",
    "created_at": "2025-11-26T10:00:00.000Z"
  }
]
```

---

#### `POST /events/:event_id/users/:user_id/presence`
**Descrição:** Confirma presença (Check-in).\
**Auth:** Requer Token (Atendente).\
**Response (200 OK):**
```json
{
  "message": "Presença confirmada com sucesso"
}
```

---

#### `DELETE /events/:event_id/users/:user_id`
**Descrição:** Cancela uma inscrição.\
**Auth:** Requer Token (Próprio usuário ou Atendente).\
**Response (200 OK):**
```json
{
  "message": "Inscrição cancelada com sucesso"
}
```

---

<br>

## 3. Serviço de Eventos
**Prefixo:** `/api/events`

### Rotas Públicas

#### `GET /`
**Descrição:** Lista todos os eventos disponíveis.\
**Auth:** Não requer.\
**Response (200 OK):**
```json
[
  {
    "id": 10,
    "title": "Workshop de Arquitetura",
    "description": "Aprenda sobre microsserviços",
    "starts_at": "2025-12-01T10:00:00",
    "ends_at": "2025-12-01T12:00:00",
    "location": "Auditório Principal"
  }
]
```

---

#### `GET /:event_id`
**Descrição:** Busca detalhes de um evento por ID.\
**Auth:** Não requer.\
**Response (200 OK):**
```json
{
  "id": 10,
  "title": "Workshop de Arquitetura",
  "description": "Aprenda sobre microsserviços",
  "starts_at": "2025-12-01T10:00:00",
  "ends_at": "2025-12-01T12:00:00",
  "location": "Auditório Principal"
}
```

### Rotas Protegidas (Apenas Atendentes)

#### `POST /`
**Descrição:** Cria um novo evento.\
**Auth:** Requer Token (Atendente).\
**Request Body:**
```json
{
  "title": "Workshop de Arquitetura",
  "description": "Aprenda sobre microsserviços",
  "starts_at": "2025-12-01T10:00:00",
  "ends_at": "2025-12-01T12:00:00",
  "location": "Auditório Principal"
}
```
**Response (201 Created):**
```json
{
  "id": 11,
  "title": "Workshop de Arquitetura",
  ...
}
```

---

#### `PUT /:event_id`
**Descrição:** Atualiza um evento existente.
**Auth:** Requer Token (Atendente).
**Request Body:**
```json
{
  "title": "Workshop de Arquitetura Avançada"
}
```
**Response (200 OK):**
```json
{
  "id": 11,
  "title": "Workshop de Arquitetura Avançada",
  ...
}
```

---

#### `DELETE /:event_id`
**Descrição:** Deleta um evento.\
**Auth:** Requer Token (Atendente).\
**Response (204 No Content):** *Sem corpo*

---

#### `POST /:event_id/finish`
**Descrição:** Finaliza um evento e gera certificados para os presentes.\
**Auth:** Requer Token (Atendente).\
**Response (200 OK):**
```json
{
  "message": "Processo de finalização concluído",
  "event_id": 10,
  "certificates_generated": 5,
  "total_attended": 5
}
```

---

<br>

## 4. Serviço de Certificados
**Prefixo:** `/api/certificates`

### Rotas Públicas

#### `GET /verify/:hash`
**Descrição:** Verifica a autenticidade de um certificado pelo Hash.\
**Auth:** Não requer.\
**Response (200 OK):**
```json
{
  "user_id": 1,
  "event_id": 10,
  "hash": "a1b2c3d4e5...",
  "issued_at": "2025-12-01T12:05:00"
}
```

### Rotas Protegidas

#### `GET /me`
**Descrição:** Retorna todos os certificados do usuário autenticado.\
**Auth:** Requer Token.\
**Response (200 OK):**
```json
[
  {
    "user_id": 1,
    "event_id": 10,
    "hash": "a1b2c3d4e5...",
    "issued_at": "2025-12-01T12:05:00"
  }
]
```
