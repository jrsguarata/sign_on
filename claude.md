# Sistema de Autenticação Centralizada com SSO e Landing Page

## 📋 Visão Geral do Projeto

Sistema web centralizado de autenticação (Identity Provider) que serve como ponto único de entrada para múltiplas aplicações. Inclui landing page institucional com captação de leads, dashboards diferenciados por perfil de usuário e controle completo de auditoria.

### Objetivos Principais

1. **Autenticação Centralizada (SSO)**: Um único login para acessar múltiplas aplicações
2. **Gestão Multi-tenant**: Múltiplas companhias com usuários e permissões isoladas
3. **Landing Page Institucional**: Apresentação de produtos e captação de leads
4. **Gestão de Leads**: CRM simplificado para prospecção comercial
5. **Auditoria Completa**: Rastreamento de todas as ações no sistema

---

## 🏗️ Arquitetura do Sistema

### Componentes Principais

```
┌─────────────────────────────────────────────────────────────┐
│                      LANDING PAGE                            │
│  (Público - Produtos, FAQ, Formulário de Contato)          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              AUTH SERVICE (Site Principal)                   │
│  - Autenticação JWT                                          │
│  - Cadastro de Companhias, Usuários, Aplicações            │
│  - Gestão de Permissões (ACL)                               │
│  - Dashboards por Perfil                                     │
│  - Gestão de Leads                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
       ┌───────────────┴───────────────┐
       │                               │
       ↓                               ↓
┌─────────────┐               ┌─────────────┐
│  APLICAÇÃO 1 │               │  APLICAÇÃO N │
│  (Resource  │               │  (Resource  │
│   Server)   │               │   Server)   │
└─────────────┘               └─────────────┘
```

### Padrão de Segurança

- **Protocolo**: JWT (JSON Web Tokens)
- **Modelo**: Access Token (curta duração) + Refresh Token (longa duração)
- **Validação**: Centralizada no Auth Service
- **Comunicação**: HTTPS obrigatório

---

## 👥 Perfis de Usuário

### 1. SUPER_ADMIN (Administrador do Sistema)

**Características:**
- Não pertence a nenhuma companhia (`company_id = NULL`)
- Controle total do sistema
- Único perfil que pode criar companhias e aplicações

**Permissões:**
- ✅ CRUD de companhias
- ✅ CRUD de aplicações
- ✅ CRUD de usuários SUPER_ADMIN e COMPANY_ADMIN
- ✅ Vincular/desvincular aplicações às companhias
- ✅ Gestão completa de leads e solicitações de contato
- ✅ Gestão de conteúdo da landing page
- ✅ Gestão de produtos/serviços
- ✅ Gestão de FAQ e newsletter
- ✅ Acesso a relatórios e auditoria

**Dashboard:**
```
- Dashboard (métricas gerais + leads)
- Leads & Contatos
  ├─ Pendentes
  ├─ Em Andamento
  ├─ Convertidos
  └─ Arquivados
- Companhias
- Aplicações
- Usuários
- Gestão de Conteúdo
  ├─ Landing Page
  ├─ Produtos
  ├─ FAQ
  └─ Newsletter
- Meu Perfil
```

### 2. COMPANY_ADMIN (Administrador de Companhia)

**Características:**
- Pertence a uma companhia específica
- Gerencia usuários da sua companhia
- Acessa aplicações contratadas pela companhia

**Permissões:**
- ✅ CRUD de usuários COMPANY_OPERATOR da sua companhia
- ✅ Visualizar aplicações contratadas
- ✅ Acessar aplicações com token
- ✅ Editar dados não-críticos da companhia
- ❌ Não pode criar outras companhias
- ❌ Não pode criar aplicações
- ❌ Não pode acessar dados de outras companhias

**Dashboard:**
```
- Dashboard
- Minhas Aplicações (grid clicável)
- Usuários da Empresa
- Minha Empresa
- Meu Perfil
```

### 3. COMPANY_OPERATOR (Operador de Companhia)

**Características:**
- Pertence a uma companhia específica
- Perfil operacional, sem permissões administrativas
- Apenas acessa aplicações contratadas

**Permissões:**
- ✅ Acessar aplicações contratadas
- ❌ Não pode criar/editar usuários
- ❌ Não pode gerenciar companhia
- ❌ Não pode acessar dados de outras companhias

**Dashboard:**
```
- Dashboard
- Minhas Aplicações (grid clicável)
- Meu Perfil
```

---

## 🗄️ Estrutura do Banco de Dados

### Diagrama ER Simplificado

```
users ──────┐
            ├──> companies ──> company_applications ──> applications
users ──────┘

contact_requests ──> contact_interactions
                └──> users (assigned_to)

landing_content
products
faq
newsletter_subscribers
```

### Tabelas Principais

#### **companies** - Companhias Cadastradas
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(14) UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  logo_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  deactivated_at TIMESTAMP,
  deactivated_by UUID REFERENCES users(id)
);
```

#### **users** - Usuários do Sistema
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'SUPER_ADMIN', 'COMPANY_ADMIN', 'COMPANY_OPERATOR'
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  deactivated_at TIMESTAMP,
  deactivated_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT check_role CHECK (role IN ('SUPER_ADMIN', 'COMPANY_ADMIN', 'COMPANY_OPERATOR')),
  CONSTRAINT check_company_for_role CHECK (
    (role = 'SUPER_ADMIN' AND company_id IS NULL) OR
    (role IN ('COMPANY_ADMIN', 'COMPANY_OPERATOR') AND company_id IS NOT NULL)
  )
);
```

#### **applications** - Aplicações/Sites Disponíveis
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500) NOT NULL,
  icon_url VARCHAR(500),
  api_key VARCHAR(255) UNIQUE, -- Para autenticar chamadas da aplicação
  active BOOLEAN DEFAULT true,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  deactivated_at TIMESTAMP,
  deactivated_by UUID REFERENCES users(id)
);
```

#### **company_applications** - Aplicações Contratadas
```sql
CREATE TABLE company_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  contracted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- Controle de vigência (opcional)
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  deactivated_at TIMESTAMP,
  deactivated_by UUID REFERENCES users(id),
  
  UNIQUE(company_id, application_id)
);
```

#### **contact_requests** - Solicitações da Landing Page
```sql
CREATE TABLE contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company_name VARCHAR(255),
  message TEXT NOT NULL,
  interested_in VARCHAR(100), -- 'demo', 'trial', 'pricing', 'partnership', 'other'
  products JSONB, -- IDs dos produtos de interesse
  
  -- Gestão do lead
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'contacted', 'converted', 'archived'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT, -- Notas internas
  contacted_at TIMESTAMP,
  converted_at TIMESTAMP,
  
  -- Tracking
  source VARCHAR(50), -- 'landing_page', 'chat', 'email', 'phone'
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_assigned_to (assigned_to)
);
```

#### **contact_interactions** - Histórico de Interações com Leads
```sql
CREATE TABLE contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_request_id UUID REFERENCES contact_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  interaction_type VARCHAR(50) NOT NULL, -- 'email', 'phone', 'meeting', 'note'
  subject VARCHAR(255),
  description TEXT NOT NULL,
  next_followup_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_contact_request (contact_request_id),
  INDEX idx_created_at (created_at)
);
```

#### **products** - Produtos para Landing Page
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  short_description VARCHAR(500),
  full_description TEXT,
  features JSONB, -- ["Feature 1", "Feature 2", ...]
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  image_url VARCHAR(500),
  icon_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  deactivated_at TIMESTAMP,
  deactivated_by UUID REFERENCES users(id)
);
```

#### **landing_content** - Conteúdo Dinâmico da Landing Page
```sql
CREATE TABLE landing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section VARCHAR(100) NOT NULL, -- 'hero', 'about', 'features', 'pricing', 'testimonials'
  title VARCHAR(255),
  subtitle VARCHAR(500),
  content TEXT,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  button_text VARCHAR(100),
  button_link VARCHAR(500),
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  deactivated_at TIMESTAMP,
  deactivated_by UUID REFERENCES users(id),
  
  UNIQUE(section, display_order)
);
```

#### **faq** - Perguntas Frequentes
```sql
CREATE TABLE faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100), -- 'general', 'pricing', 'technical', 'security'
  display_order INT DEFAULT 0,
  views INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  deactivated_at TIMESTAMP,
  deactivated_by UUID REFERENCES users(id)
);
```

#### **refresh_tokens** - Controle de Tokens
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash)
);
```

#### **access_logs** - Logs de Auditoria
```sql
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  action VARCHAR(100), -- 'login', 'logout', 'access_app', 'token_refresh'
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

#### **newsletter_subscribers** - Assinantes da Newsletter
```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  subscribed_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  source VARCHAR(50), -- 'landing_page', 'blog', 'promotion'
  active BOOLEAN DEFAULT true,
  
  INDEX idx_email (email),
  INDEX idx_subscribed_at (subscribed_at)
);
```

### Views de Auditoria

```sql
-- View consolidada de auditoria
CREATE VIEW audit_trail AS
SELECT 
  'users' as table_name,
  id as record_id,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deactivated_at,
  deactivated_by,
  active
FROM users
UNION ALL
SELECT 
  'companies' as table_name,
  id as record_id,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deactivated_at,
  deactivated_by,
  active
FROM companies
UNION ALL
SELECT 
  'applications' as table_name,
  id as record_id,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deactivated_at,
  deactivated_by,
  active
FROM applications;
```

---

## 🔐 Sistema de Autenticação JWT

### Estrutura dos Tokens

#### Access Token (Curta duração - 15 minutos)
```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "name": "João Silva",
  "role": "COMPANY_ADMIN",
  "company_id": "company_uuid",
  "company_name": "Empresa XYZ",
  "permissions": ["app_id_1", "app_id_2"],
  "iat": 1234567890,
  "exp": 1234568790,
  "type": "access"
}
```

#### Refresh Token (Longa duração - 7 dias)
```json
{
  "sub": "user_uuid",
  "jti": "unique_token_id",
  "iat": 1234567890,
  "exp": 1234654290,
  "type": "refresh"
}
```

### Fluxos de Autenticação

#### 1. Login Inicial

```
┌──────────┐         ┌──────────────┐         ┌─────────────┐
│ Usuário  │         │ Auth Service │         │  Database   │
└────┬─────┘         └──────┬───────┘         └──────┬──────┘
     │                      │                        │
     │  POST /auth/login    │                        │
     │  {email, password}   │                        │
     ├─────────────────────>│                        │
     │                      │  Buscar usuário        │
     │                      ├───────────────────────>│
     │                      │                        │
     │                      │  Validar senha (bcrypt)│
     │                      │<───────────────────────┤
     │                      │                        │
     │                      │  Gerar tokens          │
     │                      │                        │
     │                      │  Armazenar refresh     │
     │                      ├───────────────────────>│
     │                      │                        │
     │  200 OK              │                        │
     │  {access, refresh}   │                        │
     │<─────────────────────┤                        │
     │                      │                        │
```

#### 2. Acesso a Recurso Protegido

```
┌──────────┐         ┌──────────────┐         ┌─────────────┐
│ Cliente  │         │ Auth Service │         │ Aplicação   │
└────┬─────┘         └──────┬───────┘         └──────┬──────┘
     │                      │                        │
     │                      │  GET /api/data         │
     │                      │  Authorization: Bearer │
     │                      │<───────────────────────┤
     │                      │                        │
     │                      │  POST /auth/validate   │
     │                      │  {token}               │
     │                      │                        │
     │                      │  Verificar assinatura  │
     │                      │  Verificar expiração   │
     │                      │  Buscar permissões     │
     │                      │                        │
     │                      │  200 OK                │
     │                      │  {valid, user, perms}  │
     │                      ├───────────────────────>│
     │                      │                        │
     │                      │  Processar requisição  │
     │                      │                        │
     │                      │  200 OK {data}         │
     │<──────────────────────────────────────────────┤
     │                      │                        │
```

#### 3. Renovação de Token

```
┌──────────┐         ┌──────────────┐         ┌─────────────┐
│ Cliente  │         │ Auth Service │         │  Database   │
└────┬─────┘         └──────┬───────┘         └──────┬──────┘
     │                      │                        │
     │  POST /auth/refresh  │                        │
     │  {refresh_token}     │                        │
     ├─────────────────────>│                        │
     │                      │  Validar refresh       │
     │                      ├───────────────────────>│
     │                      │                        │
     │                      │  Verificar revogação   │
     │                      │<───────────────────────┤
     │                      │                        │
     │                      │  Gerar novo access     │
     │                      │                        │
     │  200 OK              │                        │
     │  {access_token}      │                        │
     │<─────────────────────┤                        │
     │                      │                        │
```

#### 4. Acesso a Aplicação Externa

```
┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│ Usuário  │    │  Dashboard   │    │Auth Service │    │Aplicação │
└────┬─────┘    └──────┬───────┘    └──────┬──────┘    └────┬─────┘
     │                 │                    │                │
     │ Clicar no App   │                    │                │
     ├────────────────>│                    │                │
     │                 │                    │                │
     │                 │ POST /apps/access  │                │
     │                 ├───────────────────>│                │
     │                 │                    │                │
     │                 │ Verificar permissão│                │
     │                 │ Gerar app token    │                │
     │                 │                    │                │
     │                 │ {access_url+token} │                │
     │                 │<───────────────────┤                │
     │                 │                    │                │
     │ Redirect para   │                    │                │
     │ app.com?token=X │                    │                │
     │<────────────────┤                    │                │
     │                                      │                │
     │────────────────────────────────────────────────────────>│
     │                                      │                │
     │                                      │ Validar token  │
     │                                      │<───────────────┤
     │                                      │                │
     │                                      │ Token válido   │
     │                                      ├───────────────>│
     │                                      │                │
     │                          Aplicação carregada          │
     │<────────────────────────────────────────────────────────┤
     │                                      │                │
```

---

## 🌐 API Endpoints

### Autenticação (Público)

```
POST   /api/auth/login
       Body: { email, password }
       Response: { access_token, refresh_token, user }

POST   /api/auth/logout
       Headers: { Authorization: Bearer <token> }
       Response: { message }

POST   /api/auth/refresh
       Body: { refresh_token }
       Response: { access_token }

GET    /api/auth/me
       Headers: { Authorization: Bearer <token> }
       Response: { user }

PUT    /api/auth/profile
       Headers: { Authorization: Bearer <token> }
       Body: { full_name, phone, avatar_url }
       Response: { user }

PUT    /api/auth/change-password
       Headers: { Authorization: Bearer <token> }
       Body: { current_password, new_password }
       Response: { message }

POST   /api/auth/validate
       Headers: { X-API-Key: <app_api_key> }
       Body: { token }
       Response: { valid, user, permissions }
```

### Landing Page (Público)

```
GET    /api/public/landing/content
       Response: [{ section, title, subtitle, content, ... }]

GET    /api/public/products
       Response: [{ id, name, description, price, ... }]

GET    /api/public/products/:slug
       Response: { id, name, description, features, ... }

GET    /api/public/faq
       Query: ?category=general
       Response: [{ question, answer, category }]

POST   /api/public/contact
       Body: { full_name, email, phone, company_name, message, interested_in, products[] }
       Response: { message, id }

POST   /api/public/newsletter/subscribe
       Body: { email, full_name }
       Response: { message }
```

### Dashboard Super Admin

```
# Companhias
GET    /api/admin/companies
       Query: ?active=true&page=1&limit=20
       Response: { companies[], total, page, pages }

POST   /api/admin/companies
       Body: { name, cnpj, email, phone, address }
       Response: { company }

GET    /api/admin/companies/:id
       Response: { company }

PUT    /api/admin/companies/:id
       Body: { name, email, phone, ... }
       Response: { company }

DELETE /api/admin/companies/:id
       Response: { message }

# Aplicações
GET    /api/admin/applications
       Response: { applications[] }

POST   /api/admin/applications
       Body: { name, description, url, icon_url }
       Response: { application }

PUT    /api/admin/applications/:id
       Body: { name, description, url }
       Response: { application }

DELETE /api/admin/applications/:id
       Response: { message }

# Vincular Aplicações
POST   /api/admin/companies/:id/applications
       Body: { application_id, expires_at }
       Response: { message }

DELETE /api/admin/companies/:companyId/applications/:appId
       Response: { message }

GET    /api/admin/companies/:id/applications
       Response: { applications[] }

# Usuários
GET    /api/admin/users
       Query: ?role=COMPANY_ADMIN&company_id=xxx
       Response: { users[] }

POST   /api/admin/users
       Body: { email, password, full_name, role, company_id }
       Response: { user }

PUT    /api/admin/users/:id
       Body: { full_name, email, phone, active }
       Response: { user }

DELETE /api/admin/users/:id
       Response: { message }

# Leads
GET    /api/admin/contacts
       Query: ?status=pending&assigned_to=me&page=1
       Response: { contacts[], total, stats }

GET    /api/admin/contacts/:id
       Response: { contact, interactions[] }

PUT    /api/admin/contacts/:id/status
       Body: { status }
       Response: { contact }

PUT    /api/admin/contacts/:id/assign
       Body: { user_id }
       Response: { contact }

POST   /api/admin/contacts/:id/interactions
       Body: { interaction_type, subject, description, next_followup_at }
       Response: { interaction }

GET    /api/admin/contacts/:id/interactions
       Response: { interactions[] }

GET    /api/admin/contacts/stats
       Response: { pending, contacted, converted, conversion_rate, ... }

# Conteúdo Landing Page
GET    /api/admin/landing/content
       Response: { content[] }

POST   /api/admin/landing/content
       Body: { section, title, subtitle, content, ... }
       Response: { content }

PUT    /api/admin/landing/content/:id
       Body: { title, content, ... }
       Response: { content }

DELETE /api/admin/landing/content/:id
       Response: { message }

# Produtos
GET    /api/admin/products
       Response: { products[] }

POST   /api/admin/products
       Body: { name, slug, description, features, price, ... }
       Response: { product }

PUT    /api/admin/products/:id
       Response: { product }

DELETE /api/admin/products/:id
       Response: { message }

# FAQ
GET    /api/admin/faq
       Response: { faqs[] }

POST   /api/admin/faq
       Body: { question, answer, category }
       Response: { faq }

PUT    /api/admin/faq/:id
       Response: { faq }

DELETE /api/admin/faq/:id
       Response: { message }
```

### Dashboard Company Admin

```
# Usuários da Companhia
GET    /api/company/users
       Response: { users[] }

POST   /api/company/users
       Body: { email, password, full_name, role: 'COMPANY_OPERATOR' }
       Response: { user }

PUT    /api/company/users/:id
       Response: { user }

DELETE /api/company/users/:id
       Response: { message }

# Aplicações Contratadas
GET    /api/company/applications
       Response: { applications[] }

# Informações da Companhia
GET    /api/company/info
       Response: { company }

PUT    /api/company/info
       Body: { phone, address }
       Response: { company }
```

### Acesso a Aplicações (Company Admin + Operator)

```
GET    /api/apps/available
       Response: { applications[] }

POST   /api/apps/access-token
       Body: { application_id }
       Response: { access_url: 'https://app.com?token=xxx' }
```

---

## 🎨 Landing Page

### Estrutura de Seções

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistema de Gestão Empresarial</title>
</head>
<body>
  
  <!-- 1. Header/Navbar -->
  <header>
    <nav>
      <div class="logo">SuaEmpresa</div>
      <ul class="menu">
        <li><a href="#produtos">Produtos</a></li>
        <li><a href="#sobre">Sobre</a></li>
        <li><a href="#precos">Preços</a></li>
        <li><a href="#faq">FAQ</a></li>
        <li><a href="#contato">Contato</a></li>
      </ul>
      <a href="/login" class="btn-login">Login</a>
    </nav>
  </header>

  <!-- 2. Hero Section -->
  <section id="hero">
    <h1>Transforme a gestão do seu negócio</h1>
    <p>Plataforma completa para gerenciar todas as áreas da sua empresa</p>
    <div class="cta-buttons">
      <a href="#contato" class="btn-primary">Solicitar Demo</a>
      <a href="#produtos" class="btn-secondary">Conhecer Produtos</a>
    </div>
    <img src="/images/hero.png" alt="Dashboard">
  </section>

  <!-- 3. Produtos/Serviços -->
  <section id="produtos">
    <h2>Nossos Produtos</h2>
    <div class="products-grid">
      <!-- Dinamicamente carregado da API -->
      <div class="product-card">
        <img src="/icons/product.svg" alt="">
        <h3>Sistema Financeiro</h3>
        <p>Controle completo das finanças da sua empresa</p>
        <ul class="features">
          <li>Fluxo de caixa</li>
          <li>Contas a pagar/receber</li>
          <li>Relatórios gerenciais</li>
        </ul>
        <div class="price">R$ 299/mês</div>
        <a href="#contato" class="btn">Saiba Mais</a>
      </div>
      <!-- Repetir para outros produtos -->
    </div>
  </section>

  <!-- 4. Diferenciais -->
  <section id="diferenciais">
    <h2>Por que escolher nossa plataforma?</h2>
    <div class="features-grid">
      <div class="feature">
        <i class="icon-security"></i>
        <h3>Segurança</h3>
        <p>Dados criptografados e backup automático</p>
      </div>
      <div class="feature">
        <i class="icon-cloud"></i>
        <h3>100% Cloud</h3>
        <p>Acesse de qualquer lugar, a qualquer momento</p>
      </div>
      <div class="feature">
        <i class="icon-support"></i>
        <h3>Suporte 24/7</h3>
        <p>Equipe sempre disponível para ajudar</p>
      </div>
      <div class="feature">
        <i class="icon-integrations"></i>
        <h3>Integrações</h3>
        <p>Conecte com suas ferramentas favoritas</p>
      </div>
    </div>
  </section>

  <!-- 5. Depoimentos -->
  <section id="depoimentos">
    <h2>O que nossos clientes dizem</h2>
    <div class="testimonials">
      <div class="testimonial">
        <p>"Revolucionou nossa gestão financeira!"</p>
        <cite>- João Silva, CEO da Empresa XYZ</cite>
      </div>
      <!-- Mais depoimentos -->
    </div>
  </section>

  <!-- 6. FAQ -->
  <section id="faq">
    <h2>Perguntas Frequentes</h2>
    <div class="faq-list">
      <!-- Dinamicamente carregado da API -->
      <div class="faq-item">
        <h3>Como funciona o período de teste?</h3>
        <p>Oferecemos 14 dias grátis sem necessidade de cartão de crédito.</p>
      </div>
      <!-- Mais perguntas -->
    </div>
  </section>

  <!-- 7. Formulário de Contato -->
  <section id="contato">
    <h2>Entre em contato</h2>
    <form id="contact-form">
      <div class="form-group">
        <label>Nome Completo *</label>
        <input type="text" name="full_name" required>
      </div>
      
      <div class="form-group">
        <label>Email *</label>
        <input type="email" name="email" required>
      </div>
      
      <div class="form-group">
        <label>Telefone</label>
        <input type="tel" name="phone">
      </div>
      
      <div class="form-group">
        <label>Empresa</label>
        <input type="text" name="company_name">
      </div>
      
      <div class="form-group">
        <label>Tenho interesse em:</label>
        <select name="interested_in">
          <option value="demo">Solicitar demonstração</option>
          <option value="trial">Período de teste</option>
          <option value="pricing">Informações sobre preços</option>
          <option value="partnership">Parceria comercial</option>
          <option value="other">Outros assuntos</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Produtos de interesse:</label>
        <div class="checkboxes" id="products-checkboxes">
          <!-- Dinamicamente carregado -->
        </div>
      </div>
      
      <div class="form-group">
        <label>Mensagem *</label>
        <textarea name="message" rows="5" required></textarea>
      </div>
      
      <div class="form-group">
        <label>
          <input type="checkbox" required>
          Concordo com a política de privacidade (LGPD)
        </label>
      </div>
      
      <button type="submit" class="btn-primary">Enviar Mensagem</button>
    </form>
  </section>

  <!-- 8. Newsletter -->
  <section id="newsletter">
    <h2>Fique por dentro das novidades</h2>
    <form id="newsletter-form">
      <input type="email" placeholder="Seu email">
      <button type="submit">Assinar</button>
    </form>
  </section>

  <!-- 9. Footer -->
  <footer>
    <div class="footer-content">
      <div class="footer-section">
        <h4>Empresa</h4>
        <ul>
          <li><a href="#sobre">Sobre</a></li>
          <li><a href="#contato">Contato</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>Produtos</h4>
        <ul>
          <li><a href="#produtos">Ver todos</a></li>
          <li><a href="#precos">Preços</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>Suporte</h4>
        <ul>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="/docs">Documentação</a></li>
          <li><a href="/ajuda">Central de Ajuda</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>Legal</h4>
        <ul>
          <li><a href="/privacidade">Privacidade</a></li>
          <li><a href="/termos">Termos de Uso</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>Redes Sociais</h4>
        <div class="social-links">
          <a href="#"><i class="icon-facebook"></i></a>
          <a href="#"><i class="icon-linkedin"></i></a>
          <a href="#"><i class="icon-instagram"></i></a>
          <a href="#"><i class="icon-twitter"></i></a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2026 SuaEmpresa. Todos os direitos reservados.</p>
      <a href="/login" class="btn-login">Área do Cliente</a>
    </div>
  </footer>

</body>
</html>
```

### JavaScript do Formulário de Contato

```javascript
// Carregar produtos para checkboxes
async function loadProducts() {
  const response = await fetch('/api/public/products');
  const products = await response.json();
  
  const container = document.getElementById('products-checkboxes');
  products.forEach(product => {
    container.innerHTML += `
      <label>
        <input type="checkbox" name="products[]" value="${product.id}">
        ${product.name}
      </label>
    `;
  });
}

// Enviar formulário de contato
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    company_name: formData.get('company_name'),
    message: formData.get('message'),
    interested_in: formData.get('interested_in'),
    products: formData.getAll('products[]'),
    source: 'landing_page',
    utm_source: getUrlParam('utm_source'),
    utm_medium: getUrlParam('utm_medium'),
    utm_campaign: getUrlParam('utm_campaign')
  };
  
  try {
    const response = await fetch('/api/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showSuccess('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      e.target.reset();
    } else {
      showError('Erro ao enviar mensagem. Tente novamente.');
    }
  } catch (error) {
    showError('Erro de conexão. Verifique sua internet.');
  }
});

// Capturar parâmetros UTM da URL
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Carregar produtos ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});
```

---

## 🔒 Segurança e Boas Práticas

### 1. Senhas

```javascript
// Backend - Hash de senha (bcrypt)
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Regras de senha forte
const passwordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};
```

### 2. Validação de Tokens

```javascript
// Middleware de autenticação
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se é access token
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // Buscar usuário
    const user = await db.query('SELECT * FROM users WHERE id = $1 AND active = true', [decoded.sub]);
    
    if (!user.rows[0]) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    req.user = decoded;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}
```

### 3. Autorização por Perfil

```javascript
// Middleware de autorização
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    next();
  };
}

// Uso nas rotas
app.get('/api/admin/companies', 
  authenticate, 
  authorize('SUPER_ADMIN'), 
  getCompanies
);

app.get('/api/company/users', 
  authenticate, 
  authorize('COMPANY_ADMIN'), 
  getCompanyUsers
);
```

### 4. Validação de Escopo (Company-level)

```javascript
// Middleware para garantir acesso apenas à própria companhia
function validateCompanyScope(req, res, next) {
  const { role, company_id } = req.user;
  
  if (role === 'SUPER_ADMIN') {
    return next(); // SUPER_ADMIN tem acesso a tudo
  }
  
  if (role === 'COMPANY_ADMIN' || role === 'COMPANY_OPERATOR') {
    // Verifica se está tentando acessar recurso de outra companhia
    const resourceCompanyId = req.params.companyId || req.body.company_id;
    
    if (resourceCompanyId && resourceCompanyId !== company_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
  }
  
  next();
}
```

### 5. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// Limitar tentativas de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});

app.post('/api/auth/login', loginLimiter, login);

// Limitar envios de formulário de contato
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 envios
  message: 'Limite de envios atingido. Tente novamente mais tarde.'
});

app.post('/api/public/contact', contactLimiter, createContact);
```

### 6. CORS Configuration

```javascript
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://seusite.com',
      'https://app1.seusite.com',
      'https://app2.seusite.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 7. Sanitização de Inputs

```javascript
const validator = require('validator');

function sanitizeInput(input) {
  if (typeof input === 'string') {
    return validator.escape(input.trim());
  }
  return input;
}

// Middleware de sanitização
function sanitizeBody(req, res, next) {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitizeInput(req.body[key]);
    });
  }
  next();
}
```

### 8. SQL Injection Prevention

```javascript
// ✅ CORRETO - Usar parametrized queries
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ INCORRETO - String concatenation
const user = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

### 9. HTTPS Obrigatório

```javascript
// Middleware para forçar HTTPS
function requireHTTPS(req, res, next) {
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    return next();
  }
  res.redirect('https://' + req.headers.host + req.url);
}

if (process.env.NODE_ENV === 'production') {
  app.use(requireHTTPS);
}
```

### 10. Headers de Segurança

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## 📊 Middleware de Auditoria

### Auditoria Automática

```javascript
// Middleware para adicionar created_by/updated_by automaticamente
function auditMiddleware(req, res, next) {
  if (req.user) {
    if (req.method === 'POST') {
      req.body.created_by = req.user.sub;
      req.body.updated_by = req.user.sub;
      req.body.created_at = new Date();
      req.body.updated_at = new Date();
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      req.body.updated_by = req.user.sub;
      req.body.updated_at = new Date();
    }
  }
  next();
}

app.use(auditMiddleware);
```

### Funções Helper para Desativação

```javascript
// Desativar registro (soft delete)
async function deactivateRecord(table, id, userId) {
  return await db.query(
    `UPDATE ${table} 
     SET active = false, 
         deactivated_at = NOW(), 
         deactivated_by = $1,
         updated_at = NOW(),
         updated_by = $1
     WHERE id = $2
     RETURNING *`,
    [userId, id]
  );
}

// Reativar registro
async function reactivateRecord(table, id, userId) {
  return await db.query(
    `UPDATE ${table} 
     SET active = true, 
         deactivated_at = NULL, 
         deactivated_by = NULL,
         updated_at = NOW(),
         updated_by = $1
     WHERE id = $2
     RETURNING *`,
    [userId, id]
  );
}

// Uso
await deactivateRecord('users', userId, req.user.sub);
await reactivateRecord('companies', companyId, req.user.sub);
```

### Log de Acesso

```javascript
// Middleware para log de todas as ações
async function accessLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - start;
    
    if (req.user) {
      await db.query(
        `INSERT INTO access_logs 
         (user_id, action, ip_address, user_agent, response_time, status_code) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.user.sub,
          `${req.method} ${req.path}`,
          req.ip,
          req.headers['user-agent'],
          duration,
          res.statusCode
        ]
      );
    }
  });
  
  next();
}

app.use(accessLogger);
```

---

## 🚀 Deploy e Infraestrutura

### Variáveis de Ambiente

```bash
# .env.example

# Aplicação
NODE_ENV=production
PORT=3000
APP_URL=https://auth.seusite.com

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# JWT
JWT_SECRET=seu_secret_super_seguro_aqui
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email (para notificações)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@seusite.com
SMTP_PASS=senha_app

# AWS S3 (para uploads de imagens)
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=seu-bucket
AWS_REGION=us-east-1

# Redis (para cache e sessões)
REDIS_URL=redis://localhost:6379

# Sentry (monitoramento de erros)
SENTRY_DSN=https://xxx@sentry.io/xxx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/authdb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: authdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### Nginx Configuration

```nginx
# nginx.conf

upstream auth_service {
  server app:3000;
}

server {
  listen 80;
  server_name auth.seusite.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name auth.seusite.com;

  ssl_certificate /etc/nginx/certs/fullchain.pem;
  ssl_certificate_key /etc/nginx/certs/privkey.pem;
  
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Gzip
  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

  location / {
    proxy_pass http://auth_service;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }

  # Static files
  location /static/ {
    alias /var/www/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

---

## 📈 Monitoramento e Métricas

### Queries Úteis

```sql
-- Usuários ativos por companhia
SELECT 
  c.name as company,
  COUNT(u.id) as total_users,
  COUNT(u.id) FILTER (WHERE u.last_login > NOW() - INTERVAL '7 days') as active_last_week,
  COUNT(u.id) FILTER (WHERE u.last_login > NOW() - INTERVAL '30 days') as active_last_month
FROM companies c
LEFT JOIN users u ON c.id = u.company_id AND u.active = true
WHERE c.active = true
GROUP BY c.id, c.name
ORDER BY total_users DESC;

-- Aplicações mais acessadas
SELECT 
  a.name,
  COUNT(al.id) as access_count,
  COUNT(DISTINCT al.user_id) as unique_users
FROM applications a
LEFT JOIN access_logs al ON a.id = al.application_id
WHERE al.created_at > NOW() - INTERVAL '30 days'
GROUP BY a.id, a.name
ORDER BY access_count DESC;

-- Taxa de conversão de leads
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'converted') as converted,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'converted')::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as conversion_rate
FROM contact_requests
WHERE created_at > NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Leads por origem
SELECT 
  source,
  interested_in,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (contacted_at - created_at))/3600)::INT as avg_response_hours
FROM contact_requests
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY source, interested_in
ORDER BY count DESC;
```

---

## 🧪 Testes

### Testes de Integração (Exemplo com Jest)

```javascript
// __tests__/auth.test.js

describe('Authentication', () => {
  let superAdminToken;
  let companyAdminToken;
  
  beforeAll(async () => {
    // Setup: criar usuários de teste
    await setupTestDatabase();
  });
  
  afterAll(async () => {
    // Cleanup
    await cleanupTestDatabase();
  });
  
  describe('POST /api/auth/login', () => {
    it('deve autenticar com credenciais válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'Password123!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body.user.role).toBe('SUPER_ADMIN');
      
      superAdminToken = response.body.access_token;
    });
    
    it('deve rejeitar credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'senhaerrada'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('GET /api/admin/companies', () => {
    it('SUPER_ADMIN deve listar companhias', async () => {
      const response = await request(app)
        .get('/api/admin/companies')
        .set('Authorization', `Bearer ${superAdminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    it('COMPANY_ADMIN não deve acessar', async () => {
      const response = await request(app)
        .get('/api/admin/companies')
        .set('Authorization', `Bearer ${companyAdminToken}`);
      
      expect(response.status).toBe(403);
    });
  });
});
```

---

## 📚 Documentação Adicional

### Fluxo de Onboarding de Nova Companhia

1. **SUPER_ADMIN** cria a companhia no sistema
2. **SUPER_ADMIN** vincula as aplicações contratadas
3. **SUPER_ADMIN** cria o primeiro usuário COMPANY_ADMIN
4. **SUPER_ADMIN** envia email de boas-vindas com link de ativação
5. **COMPANY_ADMIN** faz primeiro login e troca senha
6. **COMPANY_ADMIN** cria usuários COMPANY_OPERATOR
7. Usuários começam a acessar as aplicações

### Fluxo de Conversão de Lead

1. Visitante preenche formulário na landing page
2. Sistema cria registro em `contact_requests` com status "pending"
3. Notificação enviada para SUPER_ADMINs
4. SUPER_ADMIN revisa o lead e atribui para si
5. SUPER_ADMIN entra em contato (email/telefone/reunião)
6. SUPER_ADMIN registra interações no sistema
7. Ao fechar negócio, status muda para "converted"
8. SUPER_ADMIN cria a nova companhia no sistema
9. Lead se torna cliente

### Manutenção e Backup

```bash
# Backup do banco de dados (PostgreSQL)
pg_dump -h localhost -U postgres authdb > backup_$(date +%Y%m%d).sql

# Restore
psql -h localhost -U postgres authdb < backup_20260203.sql

# Backup com cron (diário às 3h)
0 3 * * * /usr/bin/pg_dump -h localhost -U postgres authdb > /backups/authdb_$(date +\%Y\%m\%d).sql
```

---

## 🎯 Roadmap Futuro

### Funcionalidades Planejadas

- [ ] Autenticação por 2FA (TOTP)
- [ ] Login social (Google, Microsoft)
- [ ] Webhooks para eventos
- [ ] API pública para integrações
- [ ] Mobile app (React Native)
- [ ] Painel de analytics avançado
- [ ] Sistema de notificações em tempo real
- [ ] Chat de suporte integrado
- [ ] Integração com CRMs externos (Salesforce, HubSpot)
- [ ] Versionamento de alterações (audit trail detalhado)
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] White-label (marca personalizada por companhia)

---

## 📞 Suporte

Para dúvidas ou suporte:
- Email: suporte@seusite.com
- Documentação: https://docs.seusite.com
- GitHub: https://github.com/seusite/auth-service

---

**Versão do Documento:** 1.0  
**Data:** 03 de Fevereiro de 2026  
**Autor:** Equipe de Desenvolvimento
