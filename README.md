# SignOn - Sistema de Autenticacao Centralizada com SSO

Sistema web centralizado de autenticacao (Identity Provider) que serve como ponto unico de entrada para multiplas aplicacoes.

## Stack Tecnologica

| Componente | Tecnologia |
|------------|------------|
| **Backend** | Node.js + Express + TypeScript |
| **Frontend** | React + Vite + TypeScript + Tailwind CSS |
| **Banco de Dados** | PostgreSQL 15 |
| **ORM** | Prisma |
| **Cache** | Redis |
| **Autenticacao** | JWT |
| **Ambiente** | Docker Compose |

## Estrutura do Projeto

```
sign_on/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       ├── schemas/
│       ├── types/
│       └── utils/
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── contexts/
        ├── hooks/
        ├── pages/
        ├── routes/
        └── styles/
```

## Iniciando o Projeto

### 1. Com Docker (Recomendado)

```bash
# Subir todos os servicos
docker-compose up -d

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rodar migrations
docker-compose exec backend npx prisma migrate dev

# Rodar seed
docker-compose exec backend npx prisma db seed
```

### 2. Desenvolvimento Local

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health

## Credenciais de Teste

Apos rodar o seed, use essas credenciais:

| Perfil | Email | Senha |
|--------|-------|-------|
| **Super Admin** | admin@signon.com | Admin@123 |
| **Company Admin** | admin@empresaexemplo.com | Admin@123 |
| **Operador** | maria@empresaexemplo.com | Operator@123 |

## Perfis de Usuario

### SUPER_ADMIN
- Controle total do sistema
- Gerencia companhias, aplicacoes e usuarios
- Acesso a leads e conteudo da landing page

### COMPANY_ADMIN
- Gerencia usuarios da sua companhia
- Acessa aplicacoes contratadas
- Pode criar operadores

### COMPANY_OPERATOR
- Apenas acessa aplicacoes contratadas
- Sem permissoes administrativas

## API Endpoints

### Autenticacao
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Usuario atual
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/change-password` - Alterar senha

### Admin (SUPER_ADMIN)
- `GET/POST /api/admin/companies` - Companhias
- `GET/POST /api/admin/applications` - Aplicacoes
- `GET/POST /api/admin/users` - Usuarios
- `GET/POST /api/admin/contacts` - Leads
- `GET/POST /api/admin/products` - Produtos
- `GET/POST /api/admin/faq` - FAQ

### Company (COMPANY_ADMIN)
- `GET/POST /api/company/users` - Usuarios da empresa
- `GET/PUT /api/company/info` - Info da empresa
- `GET /api/company/applications` - Aplicacoes contratadas

### Publico
- `GET /api/public/products` - Listar produtos
- `GET /api/public/faq` - Listar FAQ
- `POST /api/public/contact` - Enviar contato
- `POST /api/public/newsletter/subscribe` - Assinar newsletter

## Variaveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/authdb
JWT_SECRET=sua_chave_secreta_aqui
```

## Comandos Uteis

```bash
# Prisma Studio (interface visual do banco)
npx prisma studio

# Gerar nova migration
npx prisma migrate dev --name nome_da_migration

# Reset do banco
npx prisma migrate reset

# Build de producao (backend)
npm run build
```

## Licenca

MIT
