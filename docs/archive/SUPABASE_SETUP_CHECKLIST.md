
# CHECKLIST COMPLETO DE CONFIGURAÇÃO DO SUPABASE

## 1. TABELAS NECESSÁRIAS

### 1.1 Tabela: auth.users (Sistema de Autenticação)
- **Descrição:** Tabela nativa do Supabase para autenticação
- **Colunas:**
  - id (uuid, primary key) - ID único do usuário
  - email (text, unique) - Email do usuário
  - encrypted_password (text) - Senha criptografada
  - email_confirmed_at (timestamp) - Data de confirmação de email
  - created_at (timestamp) - Data de criação
  - updated_at (timestamp) - Data de atualização
- **Status:** ✅ Nativa do Supabase

### 1.2 Tabela: profiles
- **Descrição:** Perfil estendido do usuário
- **Colunas:**
  - id (uuid, primary key, FK → auth.users.id)
  - email (text, unique)
  - full_name (text)
  - avatar_url (text)
  - role (text) - 'user', 'admin', 'super_admin'
  - created_at (timestamp)
  - updated_at (timestamp)
- **Índices:** email, role
- **RLS:** Necessária

### 1.3 Tabela: categories
- **Descrição:** Categorias de produtos/cursos
- **Colunas:**
  - id (uuid, primary key)
  - name (text, unique)
  - description (text)
  - icon (text)
  - color (text)
  - created_at (timestamp)
  - updated_at (timestamp)
- **Índices:** name
- **RLS:** Necessária

### 1.4 Tabela: products
- **Descrição:** Produtos/Cursos disponíveis
- **Colunas:**
  - id (uuid, primary key)
  - title (text)
  - description (text)
  - category_id (uuid, FK → categories.id)
  - price (numeric)
  - image_url (text)
  - created_by (uuid, FK → profiles.id)
  - created_at (timestamp)
  - updated_at (timestamp)
- **Índices:** category_id, created_by
- **RLS:** Necessária

### 1.5 Tabela: product_languages
- **Descrição:** Conteúdo multilíngue de produtos
- **Colunas:**
  - id (uuid, primary key)
  - product_id (uuid, FK → products.id)
  - language_code (text) - 'pt-br', 'en', 'es', 'it'
  - title (text)
  - description (text)
  - created_at (timestamp)
- **Índices:** product_id, language_code
- **RLS:** Necessária

### 1.6 Tabela: purchases
- **Descrição:** Histórico de compras/acessos
- **Colunas:**
  - id (uuid, primary key)
  - user_id (uuid, FK → profiles.id)
  - product_id (uuid, FK → products.id)
  - purchased_at (timestamp)
  - expires_at (timestamp, nullable)
- **Índices:** user_id, product_id
- **RLS:** Necessária

### 1.7 Tabela: favorites
- **Descrição:** Produtos favoritados pelos usuários
- **Colunas:**
  - id (uuid, primary key)
  - user_id (uuid, FK → profiles.id)
  - product_id (uuid, FK → products.id)
  - created_at (timestamp)
  - **Constraint:** UNIQUE(user_id, product_id)
- **Índices:** user_id, product_id
- **RLS:** Necessária

### 1.8 Tabela: notifications
- **Descrição:** Notificações do sistema
- **Colunas:**
  - id (uuid, primary key)
  - user_id (uuid, FK → profiles.id)
  - title (text)
  - message (text)
  - type (text) - 'info', 'success', 'warning', 'error'
  - read (boolean, default: false)
  - created_at (timestamp)
- **Índices:** user_id, read
- **RLS:** Necessária

### 1.9 Tabela: user_xp
- **Descrição:** Sistema de gamificação - XP dos usuários
- **Colunas:**
  - id (uuid, primary key)
  - user_id (uuid, FK → profiles.id, unique)
  - total_xp (integer, default: 0)
  - level (integer, default: 1)
  - updated_at (timestamp)
- **Índices:** user_id
- **RLS:** Necessária

### 1.10 Tabela: course_content
- **Descrição:** Conteúdo dos cursos (aulas, módulos)
- **Colunas:**
  - id (uuid, primary key)
  - product_id (uuid, FK → products.id)
  - title (text)
  - description (text)
  - content_type (text) - 'video', 'text', 'quiz', 'assignment'
  - content_url (text)
  - order (integer)
  - created_at (timestamp)
- **Índices:** product_id, order
- **RLS:** Necessária

### 1.11 Tabela: user_progress
- **Descrição:** Progresso do usuário nos cursos
- **Colunas:**
  - id (uuid, primary key)
  - user_id (uuid, FK → profiles.id)
  - product_id (uuid, FK → products.id)
  - content_id (uuid, FK → course_content.id)
  - completed (boolean, default: false)
  - completed_at (timestamp, nullable)
  - **Constraint:** UNIQUE(user_id, content_id)
- **Índices:** user_id, product_id
- **RLS:** Necessária

### 1.12 Tabela: clients (Para sistema de clientes/pacotes)
- **Descrição:** Clientes do sistema
- **Colunas:**
  - id (uuid, primary key)
  - admin_id (uuid, FK → profiles.id)
  - name (text)
  - email (text)
  - client_code (text, unique)
  - created_at (timestamp)
- **Índices:** admin_id, client_code
- **RLS:** Necessária

### 1.13 Tabela: packages (Para sistema de pacotes/armazenamento)
- **Descrição:** Pacotes de armazenamento/serviços
- **Colunas:**
  - id (uuid, primary key)
  - client_id (uuid, FK → clients.id)
  - name (text)
  - storage_limit (integer) - em GB
  - base_fee (numeric)
  - storage_fee (numeric)
  - extra_services (jsonb)
  - created_at (timestamp)
- **Índices:** client_id
- **RLS:** Necessária

## 2. RELAÇÕES (FOREIGN KEYS)

| Tabela Origem | Coluna | Tabela Destino | Coluna | Ação Delete |
|---|---|---|---|---|
| profiles | id | auth.users | id | CASCADE |
| products | category_id | categories | id | CASCADE |
| products | created_by | profiles | id | SET NULL |
| product_languages | product_id | products | id | CASCADE |
| purchases | user_id | profiles | id | CASCADE |
| purchases | product_id | products | id | CASCADE |
| favorites | user_id | profiles | id | CASCADE |
| favorites | product_id | products | id | CASCADE |
| notifications | user_id | profiles | id | CASCADE |
| user_xp | user_id | profiles | id | CASCADE |
| course_content | product_id | products | id | CASCADE |
| user_progress | user_id | profiles | id | CASCADE |
| user_progress | product_id | products | id | CASCADE |
| user_progress | content_id | course_content | id | CASCADE |
| clients | admin_id | profiles | id | CASCADE |
| packages | client_id | clients | id | CASCADE |

## 3. POLÍTICAS RLS (ROW LEVEL SECURITY)

### 3.1 Tabela: profiles
- **Política 1:** SELECT - Public (todos podem ver perfis públicos)
  