# PRD — UffiSolutions Knowledge Platform
**Versão:** 1.0  
**Data:** 30 Junho 2026  
**Autor:** UffiSolutions  
**Status:** Living Document (actualizado conforme o produto evolui)

---

## Índice

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Problema que Resolve](#2-problema-que-resolve)
3. [Objectivos do Produto](#3-objectivos-do-produto)
4. [Personas de Utilizador](#4-personas-de-utilizador)
5. [Arquitectura do Sistema](#5-arquitectura-do-sistema)
6. [Funcionalidades — Área Pública](#6-funcionalidades--área-pública)
7. [Funcionalidades — Dashboard do Utilizador](#7-funcionalidades--dashboard-do-utilizador)
8. [Funcionalidades — Painel Administrativo](#8-funcionalidades--painel-administrativo)
9. [Sistema de Acesso e Entrega de Conteúdo](#9-sistema-de-acesso-e-entrega-de-conteúdo)
10. [Sistema de Autenticação e Segurança](#10-sistema-de-autenticação-e-segurança)
11. [Sistema de Permissões e Roles](#11-sistema-de-permissões-e-roles)
12. [Internacionalização (i18n)](#12-internacionalização-i18n)
13. [Base de Dados — Schema Completo](#13-base-de-dados--schema-completo)
14. [Fluxos de Utilizador — Guia Completo](#14-fluxos-de-utilizador--guia-completo)
15. [Requisitos Não-Funcionais](#15-requisitos-não-funcionais)
16. [Roadmap e Funcionalidades Futuras](#16-roadmap-e-funcionalidades-futuras)
17. [Glossário](#17-glossário)

---

## 1. Visão Geral do Produto

**UffiSolutions** é uma plataforma digital de infoprodutos (cursos, PDFs, vídeos, ferramentas e recursos) destinada a empreendedores globais — com foco em comunidades portuguesas, brasileiras, espanholas e italianas.

A plataforma funciona como um **portal de conhecimento multi-idioma**, onde:
- Utilizadores descobrem, compram e acedem a conteúdos digitais
- Administradores gerem o catálogo, utilizadores e acessos
- Conteúdos são entregues de forma segura (links privados nunca visíveis ao utilizador)

**URL da Plataforma:** Portal de acesso único via web browser  
**Modelo de Negócio:** Venda directa de infoprodutos (pagamento único) + recursos gratuitos como captação de leads

---

## 2. Problema que Resolve

### Para o Utilizador Final
- Difícil encontrar conteúdo de qualidade sobre empreendedorismo em múltiplos idiomas num só lugar
- Plataformas genéricas não respeitam a língua/cultura do utilizador
- Sem controlo sobre o que já comprou ou tem acesso

### Para o Admin / Criador de Conteúdo
- Gerir acessos a múltiplos utilizadores manualmente é trabalhoso
- Não há forma fácil de entregar diferentes tipos de conteúdo (PDF, vídeo, link externo, Drive) sem expor os URLs
- Criar e gerir utilizadores, produtos e categorias requer ferramentas dispersas

---

## 3. Objectivos do Produto

| Objectivo | Métrica de Sucesso |
|---|---|
| Utilizadores encontram e acedem a conteúdos sem fricção | Tempo médio até primeiro acesso < 2 minutos |
| Admin consegue gerir todo o ciclo num único painel | 100% das operações CRUD sem tocar em código |
| Conteúdo entregue de forma segura | URLs de entrega nunca expostos no browser |
| Suporte multi-idioma real | Interface disponível em EN/PT/ES/IT |
| Performance rápida | Build < 1.2 MB gzip, LCP < 2.5s |

---

## 4. Personas de Utilizador

### Persona A — O Empreendedor da Diáspora
- **Nome:** João, 34 anos, Lisboa / Londres
- **Contexto:** Português emigrado, quer aprender sobre negócios internacionais
- **Necessidade:** Conteúdo em português ou inglês, acessível no telemóvel
- **Frustração:** Plataformas em inglês com conteúdo irrelevante para a sua realidade
- **Jornada:** Descobre via redes sociais → Regista-se → Acessa recurso gratuito → Compra curso premium

### Persona B — A Empreendedora Italiana
- **Nome:** Sofia, 28 anos, Milão
- **Contexto:** Quer importar produtos do Reino Unido para Itália
- **Necessidade:** Guias práticos em italiano sobre regulamentação e logística
- **Jornada:** Chega pela landing page em IT → Vê produtos filtrados por idioma → Compra

### Persona C — O Admin / Gestor de Conteúdo
- **Nome:** Tejo, Fundador da UffiSolutions
- **Contexto:** Cria conteúdo, gere utilizadores, atribui acessos manualmente
- **Necessidade:** Dashboard completo, rápido, sem necessidade de código
- **Tarefas principais:** Criar produtos, configurar links de entrega, atribuir acessos a utilizadores específicos

---

## 5. Arquitectura do Sistema

```
┌────────────────────────────────────────────────────────────────────┐
│                          BROWSER (React SPA)                       │
│                                                                    │
│   Landing Page  ←→  Auth Pages  ←→  User Dashboard  ←→  Admin     │
│   (público)          (login/reg)    (protegido)         (protegido)│
└───────────────────────────┬────────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                  │
│                                                                   │
│  Auth (JWT)  │  PostgreSQL (RLS)  │  Storage  │  Realtime         │
│                                                                   │
│  Tables:                                                          │
│  profiles · products · categories · purchases                     │
│  user_product_access · product_deliverables                       │
│  favorites · notifications                                        │
└───────────────────────────────────────────────────────────────────┘
```

### Stack Tecnológica

| Componente | Tecnologia | Versão |
|---|---|---|
| Framework Frontend | React | 18.2 |
| Build Tool | Vite | 7.3 |
| Roteamento | React Router | 6.16 |
| Backend-as-a-Service | Supabase | 2.30 |
| Estilização | Tailwind CSS | 3 JIT |
| Animações | Framer Motion | 10 |
| Componentes UI | shadcn/ui + Radix UI | — |
| Drag & Drop | @dnd-kit/core | 6.3 |
| Idiomas | Sistema próprio (translations.js) | — |

---

## 6. Funcionalidades — Área Pública

### 6.1 Landing Page (`/`)
- Hero section com CTA principal
- Grid de produtos do catálogo (todos activos)
- Filtros por idioma com flags
- Barra de pesquisa por nome/descrição
- Secção de produtos em destaque (featured)
- Footer com parceiros, links legais, copyright

**Comportamento se logado:** Redireccionado automaticamente para `/dashboard`

### 6.2 Página de Produtos (`/products`)
- Listagem completa do catálogo
- Filtros por categoria, idioma, preço (Free/Paid)

### 6.3 Detalhe do Produto (`/products/:id`)
- Imagem de capa, título, descrição completa
- Preço e nível (Beginner/Intermediate/Advanced)
- Botão "Buy Now" (liga ao Stripe) se produto pago
- Botão "Access Content" se utilizador já tem acesso
- Produtos relacionados

### 6.4 Autenticação
- **Login** (`/login`): email + password, "Remember me", "Forgot password"
- **Registo** (`/register`): nome, email, password, confirmação
- **Reset de Password**: Modal no login → email com link → página de reset
- **Confirmação de Email**: Modal pós-registo com instruções

---

## 7. Funcionalidades — Dashboard do Utilizador

**Rota:** `/dashboard` | **Acesso:** Utilizadores autenticados

### 7.1 Header do Dashboard
- Logo + Nome da plataforma (clicável → homepage)
- Ícone Home, ícone Catálogo
- Botão "Admin" (apenas para administradores)
- Botão Sign Out

### 7.2 Secção de Boas-Vindas
- "Welcome back, [Nome]"
- Client Code copiável (código único do utilizador)

### 7.3 Produtos Desbloqueados ("Unlocked Products")
Mostra todos os produtos a que o utilizador tem acesso:
- Via compra (tabela `purchases`)
- Via concessão manual de admin (tabela `user_product_access`)
- Com indicador de expiração se aplicável

### 7.4 Recursos Gratuitos ("Free Resources")
Produtos gratuitos filtrados pelo **idioma preferido** do utilizador (definido no primeiro login).

### 7.5 Product Card
Cada card mostra:
- Imagem de capa (ou ícone da categoria se sem imagem)
- Cor dinâmica da categoria (borda, gradiente, botões)
- Flag do idioma + badge PDF/Video/etc. (se configurado)
- Badge Free / Premium (glassmorphism)
- Chip da categoria com ícone
- Título e descrição breve
- Botão "Access" ou "Download" (dependendo do tipo)

### 7.6 Modal de Acesso (AccessModal)
Ao clicar em qualquer botão de acesso:
- Abre overlay com informações do produto
- Badge "Access Confirmed" (verde) ou "Access Expired" (vermelho)
- Lista de links de entrega **agrupados por tipo**:
  - PDFs → botões de download
  - Videos → abre nova aba
  - External → abre nova aba
  - Google Drive → abre nova aba
  - Other → abre nova aba
- **URLs nunca visíveis** — apenas botões com labels e ícones
- "Content not yet available" se sem links configurados
- Fecha ao clicar no X ou no overlay

### 7.7 Modal de Boas-Vindas (Primeiro Login)
No primeiro acesso, o utilizador escolhe o seu idioma preferido. Esta preferência determina quais recursos gratuitos aparecem no dashboard.

---

## 8. Funcionalidades — Painel Administrativo

**Rota base:** `/admin` | **Acesso:** roles `admin` e `super_admin`

### 8.1 Layout Admin
Sidebar persistente com 3 grupos colapsáveis:

```
OVERVIEW
  └ Dashboard

CONTENT
  └ Products
  └ Categories

USERS & ACCESS
  └ Users
  └ Access Board
```

Header com: avatar + role badge + breadcrumb + "My Area" + Sign Out

### 8.2 Admin Dashboard (`/admin`)
- Métricas animadas: Total Users, Confirmed Emails, Total Products, New This Week
- Quick access cards para todas as secções
- Gráfico: Products by Language (bar chart)
- Gráfico: Product Mix Free vs Paid (progress bars)
- Tabs: Overview / Analytics / My Role (grid de permissões detalhado)

### 8.3 Admin Products (`/admin/products`)

#### Lista de Produtos
- Tabela com: nome + badge de tipo, categoria, preço, idioma, tipo de conteúdo, status
- Pesquisa por nome
- Filtro por categoria e idioma
- Acções: editar, eliminar, destacar (featured star)

#### Modal de Produto (Criar / Editar)
**Aba 1 — Public Info:**
- Nome, Categoria (required)
- Descrição pública
- Preço (£) com detecção automática Free/Paid
- Idioma (PT/EN/ES/IT)
- Nível (Beginner/Intermediate/Advanced)
- Imagem URL com preview em tempo real
- Toggle Featured (se admin tem permissão)
- Toggle Active (visível no catálogo)

**Aba 2 — Content & Delivery (privado):**
- Lista repetível de deliverables (sem limite)
- Cada item: tipo (ícone selecionável) + label opcional + URL
- Tipos disponíveis: PDF · Video · External · Google Drive · Other
- "Content & Delivery" permanece **privado** — nunca mostrado ao utilizador directamente
- Stripe Payment URL (apenas para produtos pagos)

### 8.4 Admin Categories (`/admin/categories`)
- Grid de categorias com cor e ícone
- CRUD completo (criar, editar, eliminar)
- Cada categoria tem: nome, slug, ícone (emoji), cor hex, descrição, status

### 8.5 Admin Users (`/admin/users`)

#### Lista de Utilizadores
- Tabela com: avatar, nome, email, role badge, client code, product count (activos/expirados)
- Pesquisa por nome/email
- Filtro por role

#### Acções por Utilizador
- **Grant Access**: modal de 2 passos — seleccionar produtos (multi-checkbox) → confirmar com data de expiração (padrão: 12 meses)
- **Access Drawer**: drawer lateral com lista completa de acessos do utilizador — editar expiração, revogar, ou definir como "Lifetime" (permanente)
- **Reset Password**: enviar link de reset por email

### 8.6 Access Board (`/admin/access-board`)
Kanban visual para gestão de acessos:

```
[Coluna Esquerda]          [Coluna Direita]
PRODUCTS (9)               USERS (2)
  □ Curso de Italiano  →  ┌──────────────────┐
  □ mentorITA          →  │ joao@gmail.com   │
  □ CURSO BRASIL 2026     │ 4 products       │
  ☑ compra assistida   →  └──────────────────┘
                          ┌──────────────────┐
  Filter: All/Free/Premium │ sofia@gmail.com  │
  Search by name          │ 0 products       │
                          └──────────────────┘
```

- **Drag & Drop**: arrastar produto para user card = conceder acesso
- **Multi-select**: checkbox para seleccionar múltiplos produtos
- **Expandir user card**: ver lista completa de produtos com datas
- **Gestão inline**: editar expiração, definir Lifetime, revogar

---

## 9. Sistema de Acesso e Entrega de Conteúdo

### 9.1 Fontes de Acesso (por ordem de prioridade)
```
1. purchases (via Stripe — pagamento confirmado)
2. user_product_access (concessão manual por admin, com expiração)
```
> Nota: `profiles.product_access` (legado) foi intencionalmente excluído para evitar dados órfãos.

### 9.2 Deliverables (product_deliverables)
Cada produto pode ter **N links de entrega**, cada um com:
- `type`: pdf | video | external | drive | other
- `label`: nome amigável opcional (ex: "Módulo 1 — Introdução")
- `url`: link privado (nunca exposto no frontend directamente)
- `sort_order`: ordem de apresentação
- `is_active`: activo/inactivo

### 9.3 Regras de Visibilidade de Links
```
Admin  → vê e edita URLs no modal do produto
Utilizador → NUNCA vê URLs; vê apenas botões com label e ícone
```

### 9.4 Tipos de Botão por Tipo de Deliverable
| Tipo | Ícone | Acção | Subtítulo |
|---|---|---|---|
| `pdf` | FileText (vermelho) | download directo | "Click to download your file" |
| `video` | Play (azul) | abre nova aba | "Opens in a new tab" |
| `external` | ExternalLink (roxo) | abre nova aba | "Opens in a new tab" |
| `drive` | HardDrive (verde) | abre nova aba | "Opens in a new tab" |
| `other` | Globe (zinc) | abre nova aba | "Opens in a new tab" |

### 9.5 Agrupamento no Modal
Quando um produto tem deliverables de múltiplos tipos, são agrupados com cabeçalhos:
```
— PDFs · 2 —
[📄] Apostila Completa
[📄] Exercícios Módulo 1

— VIDEOS · 3 —
[▶] Aula 1 - Introdução
[▶] Aula 2 - Avançado
[▶] Aula Bónus

— GOOGLE DRIVE · 1 —
[💾] Pasta de Recursos
```

---

## 10. Sistema de Autenticação e Segurança

### 10.1 Fluxo de Login
```
1. Utilizador preenche email + password
2. signInWithPassword() via Supabase Auth
3. LoginPage exibe "Signing in..." (sem redirect directo)
4. onAuthStateChange() em App.jsx detecta SIGNED_IN
5. getCurrentUserWithRole() — busca session + perfil + role
6. setUser(data) — React re-renderiza
7. Route /login detecta user → <Navigate to="/dashboard">
8. ProtectedRoute valida user → renderiza UserDashboard
```

**Sem race condition:** A navegação é feita pelo sistema de rotas (não por `navigate()` no LoginPage), garantindo que o user state está definido antes do redirect.

### 10.2 Fluxo de Registo
```
1. Utilizador preenche nome, email, password, confirmação
2. Validações frontend: campos obrigatórios, passwords iguais, min 6 chars
3. signUp() via Supabase Auth (com metadata: full_name, client_code)
4. upsert em profiles com os dados do utilizador
5. Email de confirmação enviado (Supabase + Resend)
6. Modal de confirmação exibido com instrução
7. Utilizador confirma email → pode fazer login
```

### 10.3 Sessão Persistente
- Tokens armazenados no localStorage pelo Supabase JS client
- `onAuthStateChange` lê a sessão activa automaticamente no load
- Safety timer de 3s evita loading infinito se Supabase falhar
- **F5 não desconecta** — os tokens são preservados

### 10.4 Logout
```
1. logout() → supabase.auth.signOut()
2. clearAllAuthTokens() — limpa localStorage/sessionStorage
3. navigate('/') — redireciona para homepage
```

### 10.5 Regras de Protecção de Rotas
| Rota | Utilizador não autenticado | Utilizador autenticado sem role admin |
|---|---|---|
| `/dashboard` | Redirect → `/login` | Acesso permitido |
| `/admin/*` | Redirect → `/login` | Redirect → `/dashboard` |
| `/login` | Mostra login | Redirect → `/dashboard` |

---

## 11. Sistema de Permissões e Roles

### 11.1 Roles Disponíveis
| Role | Descrição |
|---|---|
| `guest` | Visitante não autenticado |
| `user` | Utilizador registado |
| `moderator` | Moderação de conteúdo (só leitura admin) |
| `admin` | Gestão de produtos, utilizadores e categorias |
| `super_admin` | Acesso total + gestão de sistema |

### 11.2 Super Admin
Definido por email hardcoded em `rolePermissions.js` (actualmente: `tejotao@gmail.com`). Sempre tem role `super_admin` independentemente do valor no banco de dados.

### 11.3 Matriz de Permissões
| Recurso | user | moderator | admin | super_admin |
|---|---|---|---|---|
| Ver produtos | ✅ | ✅ | ✅ | ✅ |
| Criar/editar produtos | ❌ | read+update | ✅ | ✅ |
| Eliminar produtos | ❌ | ❌ | ✅ | ✅ |
| Featured products | ❌ | ❌ | ✅ | ✅ |
| Ver utilizadores | ❌ | read | ✅ | ✅ |
| Gerir acessos | ❌ | ❌ | ✅ | ✅ |
| Gerir sistema | ❌ | ❌ | ❌ | ✅ |

---

## 12. Internacionalização (i18n)

### 12.1 Idiomas Suportados
| Código | Idioma | Flag |
|---|---|---|
| `en` | English | 🇬🇧 |
| `pt` | Português | 🇧🇷 |
| `es` | Español | 🇪🇸 |
| `it` | Italiano | 🇮🇹 |

### 12.2 Arquitectura de Tradução
```
LanguageContext (React Context)
  ↓
getTranslation(lang, key)  ←  translations.js (flat map de chaves)
  ↓
t('chave')  ←  usado nos componentes
  ↓
Fallback: EN se chave não existe no idioma seleccionado
```

### 12.3 Scope das Traduções
- **Páginas públicas** (Home, Products, Login, Register, Footer, Header): totalmente traduzidas
- **Admin panel**: hardcoded em inglês (intencionalmente — gestão é feita pelo admin da plataforma)
- **User Dashboard**: hardcoded em inglês (interface de produto, não de marketing)
- **Terms of Use / Privacy Policy** (`/termos`, `/privacidade`): hardcoded em **inglês (UK)**, intencionalmente fora do sistema de tradução — decisão de 01/07/2026, já que a razão social (UffiSphere HTJS Ltd) é registada no Reino Unido e os documentos legais seguem UK GDPR. O link no footer continua traduzido conforme o idioma do site; só o conteúdo da página de destino é fixo em inglês

### 12.4 Seleção de Idioma
- Botões de flag no header público
- Preferência salva em `localStorage` ('app-language')
- Idioma preferido do utilizador salvo em `profiles.preferred_language` (definido no primeiro login)
- Free resources no dashboard filtradas pelo idioma preferido

---

## 13. Base de Dados — Schema Completo

### profiles
```sql
id UUID (FK → auth.users)
email TEXT
full_name TEXT
name TEXT
client_code TEXT UNIQUE
role TEXT DEFAULT 'user'
is_admin BOOLEAN DEFAULT FALSE
preferred_language TEXT DEFAULT 'pt'
language TEXT
first_login BOOLEAN DEFAULT TRUE
avatar_url TEXT
profile_image_url TEXT
status TEXT DEFAULT 'active'   -- 'active' | 'blocked' ✅ (novo)
blocked_at TIMESTAMPTZ
blocked_reason TEXT
blocked_by UUID (FK → profiles)
phone TEXT
whatsapp TEXT
contact_preference TEXT DEFAULT 'email'   -- 'email' | 'whatsapp' | 'phone' ✅ (novo)
address_street TEXT
address_number TEXT
city TEXT                       -- ✅ (novo)
postal_code TEXT
country TEXT
birth_date DATE
classification TEXT             -- ✅ (novo) admin-only: VIP/Standard/Lead/Em risco/Inativo
bio TEXT
xp INT
level TEXT                      -- gamification, não relacionado ao perfil
last_login TIMESTAMPTZ
user_id UUID                    -- legado, não usado pelo fluxo real (ver nota abaixo)
```
> Nota: o schema documentado aqui reflete o estado real confirmado via API em 01/07/2026 — colunas como `name`, `first_login`, `profile_image_url`, `language` **não existem**, apesar de referenciadas por código legado (`ProfilePage.jsx`, `UserAvatar.jsx`, trecho antigo de `UserDashboard.jsx`). Ver sessão "Perfil do Usuário" abaixo.

### products
```sql
id UUID PRIMARY KEY
name TEXT
title TEXT
slug TEXT UNIQUE
description TEXT
price DECIMAL(10,2)
is_free BOOLEAN
category_id UUID (FK → categories)
language TEXT  -- 'pt' | 'en' | 'es' | 'it'
level TEXT     -- 'beginner' | 'intermediate' | 'advanced'
image_url TEXT
featured BOOLEAN DEFAULT FALSE
active BOOLEAN DEFAULT TRUE
product_code TEXT
stripe_link TEXT
-- Legacy (mantidos para compatibilidade):
product_type TEXT DEFAULT 'content'
access_url TEXT
drive_link TEXT
```

### categories
```sql
id UUID PRIMARY KEY
name TEXT
slug TEXT UNIQUE
icon TEXT       -- emoji, ex: '📄'
color TEXT      -- hex, ex: '#7c3aed'
description TEXT
is_active BOOLEAN DEFAULT TRUE
```

### purchases
```sql
id UUID PRIMARY KEY
user_id UUID (FK → profiles)
product_id UUID (FK → products)
email TEXT
stripe_session_id TEXT
amount DECIMAL
purchased_at TIMESTAMPTZ
```

### user_product_access
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
product_id UUID NOT NULL
granted_by UUID
granted_at TIMESTAMPTZ
expiry_date DATE         -- NULL = permanente
is_active BOOLEAN DEFAULT TRUE
notes TEXT
UNIQUE (user_id, product_id)
```

### product_deliverables ✅ (novo)
```sql
id UUID PRIMARY KEY
product_id UUID (FK → products, ON DELETE CASCADE)
type TEXT CHECK (IN 'pdf','video','external','drive','other')
label TEXT       -- ex: "Módulo 1 — Introdução PDF"
url TEXT NOT NULL
sort_order INT DEFAULT 0
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### favorites
```sql
id UUID PRIMARY KEY
user_id UUID
product_id UUID
created_at TIMESTAMPTZ
```

### notifications
```sql
id UUID PRIMARY KEY
user_id UUID
title TEXT
message TEXT
is_read BOOLEAN DEFAULT FALSE
type TEXT
created_at TIMESTAMPTZ
```

---

## 14. Fluxos de Utilizador — Guia Completo

### Fluxo 1 — Primeiro Utilizador (Guest → Compra)
```
[1] Chega à Landing Page (/)
      ↓ Vê produtos, filtra por idioma, clica "Learn More"
[2] Página de Detalhe do Produto (/products/:id)
      ↓ Clica "Buy Now" → abre Stripe Checkout (link externo)
[3] Stripe processa pagamento
      ↓ Webhook cria registo em purchases (futuro) OU admin cria manualmente
[4] Registo (/register)
      ↓ Preenche nome, email, password
[5] Email de Confirmação
      ↓ Clica link no email
[6] Login (/login)
      ↓ Entra com as suas credenciais
[7] Tela "Signing in..." (300-500ms)
      ↓
[8] Dashboard (/dashboard)
      → Vê produto comprado em "Unlocked Products"
      → Clica "Access" → Modal abre com botões de entrega
      → Clica botão → Acede ao conteúdo
```

### Fluxo 2 — Utilizador com Acesso Gratuito
```
[1] Chega à Landing Page
      ↓ Vê produtos gratuitos com badge "🎁 Free"
[2] Registo → Email Confirmação → Login
[3] Modal de Boas-Vindas (primeiro login)
      ↓ Escolhe idioma preferido (PT/EN/ES/IT)
[4] Dashboard
      → "Free Resources" mostra recursos gratuitos no seu idioma
      → Clica "Access" → Modal abre com botão de entrega
```

### Fluxo 3 — Admin Concede Acesso a Utilizador
```
[1] Admin → /admin/users
      ↓ Encontra utilizador na lista
[2] Clica "Grant" na linha do utilizador
      ↓ BatchGrantModal abre
[3] Passo 1: Selecciona produtos (checkboxes)
[4] Passo 2: Confirma — define data de expiração
      ↓ Padrão: 12 meses a partir de hoje
[5] Guardar → registo criado em user_product_access
[6] Utilizador faz login → vê produto em "Unlocked Products"
```

### Fluxo 4 — Admin Configura Links de Entrega
```
[1] Admin → /admin/products
      ↓ Clica lápis (editar) no produto
[2] Modal "Edit Product" abre na aba "Public Info"
[3] Clica aba "Content & Delivery"
      → Aviso: "This information is private"
[4] Clica "+ Add Delivery Item"
      ↓ Row aparece com selector de tipo + label + URL
[5] Selecciona tipo (PDF/Video/External/Drive/Other)
[6] Preenche label (ex: "Apostila Módulo 1") e URL
[7] Repete para mais items se necessário
[8] Clica "Save Changes"
      ↓ products table actualizada + product_deliverables substituídos
[9] Utilizador com acesso → Dashboard → Access → Modal mostra os botões
```

### Fluxo 5 — Admin usa Access Board (Kanban)
```
[1] Admin → /admin/access-board
[2] Lado esquerdo: lista de produtos com filtros (All/Free/Premium)
[3] Lado direito: cards de utilizadores (zona de drop)
[4] Arrasta produto para card de utilizador
      ↓ Modal confirma concessão de acesso
[5] Acesso criado imediatamente com expiração padrão
[6] Número de produtos no card actualiza em tempo real
```

### Fluxo 6 — Utilizador com Acesso Expirado
```
[1] Utilizador faz login
[2] Dashboard → clica "Access" num produto expirado
[3] Modal abre mostrando "Access has expired"
      → "Contact support to renew"
[4] Admin → /admin/users → AccessDrawer → edita data ou reativa
[5] Utilizador actualiza dashboard → acesso restaurado
```

---

## 15. Requisitos Não-Funcionais

### Performance
- First Contentful Paint < 1.5s (Tailwind CSS purged)
- Bundle JS: ~1.15 MB bruto / ~342 KB gzip
- CSS: ~164 KB bruto / ~25 KB gzip
- Imagens servidas via CDN (Supabase Storage ou hostinger CDN)
- Queries ao banco: sem N+1 — deliverables e acessos são batch-fetched

### Segurança
- Auth via Supabase JWT (tokens expiram automaticamente + refresh)
- Row Level Security (RLS) activo em todas as tabelas sensíveis
- URLs de entrega nunca no DOM / network response do utilizador final
- Nenhuma chave secreta no frontend (apenas ANON key pública)
- Inputs sanitizados — sem injecção SQL possível via Supabase client

### Disponibilidade
- Supabase free tier: 500 MB DB, 1 GB storage, 50k MAU
- Não há servidores próprios — zero infraestrutura para manter
- Deploy via Vercel (Vite build → static hosting), conectado ao `main` do GitHub — push dispara build+deploy automático. Domínio customizado `www.uffisolutions.com` conectado (ver sessão 02/07/2026). **Ambiente de desenvolvimento local não funcional no momento** — ver sessão 02/07/2026, todo o fluxo de deploy é commit → push → Vercel, sem preview local

### Escalabilidade
- Architecture stateless no frontend — pode ser servido por qualquer CDN
- Supabase escala automaticamente
- RLS garante isolamento de dados mesmo com milhares de utilizadores

### Acessibilidade
- Estrutura semântica HTML (nav, main, section, header, footer)
- Labels em todos os inputs de formulário
- Contraste de cores: zinc/amber palette com bom contraste
- Keyboard navigation suportada nos modais (ESC para fechar, Tab para navegar)

---

## 16. Roadmap e Funcionalidades Futuras

### Q3 2026 — Alta Prioridade

#### Funil de Compra Completo
- Botão "Buy Now" no ProductDetail que abre o `stripe_link` configurado pelo admin
- Webhook do Stripe para criar automaticamente registo em `purchases`
- Email de confirmação de compra com acesso imediato

#### Perfil do Utilizador
- Página de perfil edtável (`/profile`)
- Alterar nome, foto de avatar, idioma preferido
- Alterar password

### Q4 2026 — Média Prioridade

#### Segurança RLS Aprimorada para Deliverables
Actualmente qualquer utilizador autenticado pode ler `product_deliverables` via API. Deverá ser restringido apenas a utilizadores com acesso comprovado ao produto:
```sql
CREATE POLICY "Users read own deliverables" ON product_deliverables
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM purchases WHERE product_id = product_deliverables.product_id AND email = auth.email())
    OR
    EXISTS (SELECT 1 FROM user_product_access WHERE product_id = product_deliverables.product_id AND user_id = auth.uid() AND is_active = true)
  );
```

#### Página admin/notes (Admin Notes por Produto)
Adicionar coluna `admin_notes TEXT` na tabela `products`:
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS admin_notes TEXT;
```
Depois reativar o campo no modal de produto.

#### Analytics Reais
- Ligação ao Google Analytics 4 ou Plausible
- Dashboard admin com dados reais de conversão

#### Notificações In-App
- Tabela `notifications` já existe
- Implementar bell icon com dropdown de notificações no header do user dashboard

### 2027 — Visão a Longo Prazo

| Feature | Descrição |
|---|---|
| **Cursos Sequenciais** | Módulos ordenados com progresso, marcação de conclusão |
| **Certificados** | Geração de PDF de certificado após conclusão |
| **Programa de Afiliados** | Links de referral com comissão |
| **API Pública** | Para integrações com outras plataformas (Zapier, etc.) |
| **App Mobile** | React Native ou PWA |
| **Comunidade** | Fórum ou chat por produto |
| **Assinaturas** | Modelo recorrente para acesso a biblioteca completa. **Nota 01/07/2026:** avaliada a ideia de reaproveitar o slot visual do badge "Pending" (removido do Admin Users por estar quebrado — ver sessão abaixo) para exibir status de assinatura/pagamento (ex: "Pending payment" / "Active member" / "Expired") quando esse produto de membro/assinante for desenhado. Requer tabela de assinaturas + webhook recorrente do Stripe; o badge em si é só a última peça |

---

## 17. Glossário

| Termo | Definição |
|---|---|
| **Deliverable** | Link de entrega de conteúdo associado a um produto (PDF, vídeo, link, etc.) |
| **Access Grant** | Concessão manual de acesso a um produto por um administrador |
| **Lifetime Access** | Acesso sem data de expiração (expiry_date = NULL) |
| **Client Code** | Código único de identificação do utilizador (ex: UFFI-001) |
| **Super Admin** | Administrador com acesso total, definido por email |
| **RLS** | Row Level Security — política de acesso a nível de linha no PostgreSQL |
| **Product Type** | Classificação do conteúdo de um produto: pdf, video, external, drive, other |
| **Featured** | Produto destacado na homepage |
| **Free Resource** | Produto com preço 0, disponível para todos os utilizadores do idioma correspondente |
| **AccessModal** | Modal no dashboard do utilizador que apresenta os botões de entrega de conteúdo |
| **BatchGrant** | Concessão de acesso a múltiplos produtos para um utilizador em simultâneo |
| **Access Board** | Vista Kanban para gestão visual de acessos por drag & drop |

---

*Este documento é um artefacto vivo — deve ser actualizado sempre que novas funcionalidades forem adicionadas ou requisitos alterados.*

**UffiSolutions © 2026 — Todos os direitos reservados**

---
---

# Relatório de Status Técnico — UffiSolutions 2026
**Data:** 30 Junho 2026 | **Build:** ✅ `2386 modules · built in 2.93s`

---

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 7 |
| Roteamento | React Router v6 |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Estilo | Tailwind CSS v3 JIT |
| Animações | Framer Motion 10 |
| UI Components | shadcn/ui + Radix UI |
| Drag-and-drop | @dnd-kit/core |
| i18n | Sistema próprio via `translations.js` (en/pt/es/it) |

---

## Banco de dados — tabelas ativas

| Tabela | Propósito |
|---|---|
| `profiles` | Perfis dos utilizadores (nome, role, client_code, preferred_language) |
| `products` | Catálogo de produtos (público) |
| `categories` | Categorias com cor e ícone |
| `purchases` | Compras via Stripe |
| `user_product_access` | Acessos manuais por admin (com expiração) |
| `product_deliverables` | Links de entrega por produto — múltiplos por tipo |
| `favorites` | Favoritos do utilizador |
| `notifications` | Sistema de notificações |

---

## Rotas registadas

| Rota | Acesso | Componente |
|---|---|---|
| `/` | Público (→ `/dashboard` se logado) | HomePage |
| `/login` | Público (→ `/dashboard` se logado) | LoginPage |
| `/register` | Público (→ `/dashboard` se logado) | RegisterPage |
| `/products` | Público | ProductsPage |
| `/products/:id` | Público | ProductDetail |
| `/dashboard` | 🔒 Utilizador autenticado | UserDashboard |
| `/admin` | 🔒 Admin/Super Admin | AdminDashboard |
| `/admin/products` | 🔒 Admin/Super Admin | AdminProducts |
| `/admin/categories` | 🔒 Admin/Super Admin | AdminCategories |
| `/admin/users` | 🔒 Admin/Super Admin | AdminUsers |
| `/admin/access-board` | 🔒 Admin/Super Admin | AccessBoard |

---

## Funcionalidades implementadas (sessão 30/06/2026)

### Auth & Login
- Race condition corrigida: `navigate('/dashboard')` removido do LoginPage; App.jsx cuida do redirect via `onAuthStateChange`
- Tela "Signing in...": após login bem-sucedido, mostra feedback visual enquanto auth state resolve
- Sessão persistente: sem `clearAllAuthTokens()` no startup — F5 não desconecta
- Redirect inteligente: `/`, `/login`, `/register` redirecionam para `/dashboard` se sessão ativa

### Sistema de traduções (4 idiomas: en/pt/es/it)
Chaves adicionadas: `toast.login_success`, `toast.login_error`, `modals.recovery.*`, `buttons.ok`, `nav.home`, `nav.products`, `messages.*` (footer — zero chaves brutas visíveis)

### Header (público)
- Admin/Super Admin: dropdown completo (Dashboard, My Products, Account Settings, Admin Area, Sign Out)
- Utilizador regular: badge verde animado "● Logged in: Nome"
- Guest: botão "Sign In" âmbar

### UserDashboard
- Secções "Unlocked Products" e "Free Resources" (filtradas por idioma preferido)
- ProductCard com cores dinâmicas da categoria (borda esquerda, gradiente, botões)
- AccessModal com deliverables agrupados por tipo (PDFs / Videos / External / Drive / Other)
- URLs nunca expostos; "Content not yet available" se sem links
- Batch fetch de deliverables (uma query, sem N+1)

### AdminLayout
- Sidebar persistente com 3 grupos colapsáveis: Overview / Content / Users & Access
- Breadcrumb no header + badge "System Online" + avatar com role badge colorido

### Admin → Products
- Aba "Content & Delivery" reescrita: lista repetível de deliverables (sem limite)
- Cada item: tipo (ícone selecionável) + label opcional + URL
- Contador de links no tab e na tabela da lista

### Admin → Users
- BatchGrantModal: selecção múltipla, confirmação 2 passos, expiração padrão 12 meses
- AccessDrawer: edição inline de expiração, revogação, lifetime

### Admin → Access Board
- Kanban drag-and-drop: arrastar produto para user card = conceder acesso
- Multi-select com checkbox; expandir user card para ver lista de produtos

### Admin → Dashboard
- Métricas animadas (CountUp), charts de produtos por idioma e mix Free/Paid
- Tabs: Overview / Analytics / My Role

---

## Ficheiros criados/modificados

| Ficheiro | Estado |
|---|---|
| `src/App.jsx` | Modificado — race condition fix, safety timer |
| `src/pages/LoginPage.jsx` | Modificado — loginSuccess state, tela "Signing in..." |
| `src/pages/UserDashboard.jsx` | Modificado — AccessModal multi-tipo agrupado, deliverables batch fetch |
| `src/pages/admin/AdminProducts.jsx` | Modificado — Content & Delivery reescrito (lista repetível) |
| `src/pages/admin/AdminDashboard.jsx` | Modificado — reescrito completo |
| `src/pages/admin/AdminUsers.jsx` | Modificado — BatchGrantModal, AccessDrawer |
| `src/pages/admin/AccessBoard.jsx` | Modificado — Kanban dnd-kit |
| `src/pages/admin/AdminCategories.jsx` | Modificado |
| `src/components/admin/AdminLayout.jsx` | Modificado — sidebar agrupada colapsável |
| `src/components/uffi/Header.jsx` | Modificado — role-based dropdowns |
| `src/lib/translations.js` | Modificado — 20+ chaves por idioma adicionadas |
| `src/lib/accessQueries.js` | Criado — CRUD user_product_access |
| `src/lib/deliverableQueries.js` | Criado — CRUD product_deliverables (batch fetch) |
| `src/lib/catalogQueries.js` | Modificado — fetchAllUsers com deduplicação por email |
| `sql/2026-06-30_product_deliverables.sql` | Criado — executado com sucesso ✅ |

---

## SQL executado no Supabase

```sql
-- Tabela criada
CREATE TABLE IF NOT EXISTS public.product_deliverables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('pdf','video','external','drive','other')),
  label TEXT,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- + RLS policies + updated_at trigger + migração de access_url/drive_link existentes
```

---

## Pendente / sugestões futuras

| Item | Prioridade | Observação |
|---|---|---|
| **Funil de compra Stripe** | Alta | `stripe_link` salvo mas botão de compra não implementado |
| **Perfil do utilizador** | Média | Página `/profile` editável (nome, foto, idioma, password) |
| **`admin_notes` no schema** | Baixa | `ALTER TABLE products ADD COLUMN admin_notes TEXT;` |
| **RLS restritiva para deliverables** | Alta | Limitar SELECT só a utilizadores com acesso comprovado |
| **ProductDetail para utilizadores com acesso** | Média | Mostrar "Access" em vez de "Buy Now" |
| **Notificações in-app** | Média | Tabela já existe, falta UI |

---

## Status geral

```
✅ Build limpo — 2386 módulos, 0 erros
✅ Auth flow — login/logout/sessão persistente/redirect sem race condition
✅ i18n — 4 idiomas, zero chaves brutas no UI
✅ Admin panel — 5 páginas com sidebar persistente e agrupada
✅ Deliverables — múltiplos links por produto, por tipo, agrupados no modal
✅ User dashboard — modal de acesso seguro, URL nunca exposta
✅ Access system — purchases + user_product_access + expiração
✅ Drag-and-drop — Access Board funcional
✅ SQL executado — tabela product_deliverables criada + dados migrados
✅ Password Reset — /reset-password testado ponta a ponta (email → link → nova senha → login) em 01/07/2026
✅ User Block/Unblock — testado ponta a ponta (admin bloqueia → badge vermelha → login da conta bloqueada → tela "Account blocked" → unblock → acesso normal) em 01/07/2026
✅ Stripe checkout → webhook → acesso automático — testado ponta a ponta em sandbox E em produção (compra real, cartão real) em 04-05/07/2026
✅ Ambientes separados — branch `staging` (Preview, chaves de teste) isolada da `main` (Production, chaves live) na Vercel, com Protection Bypass configurado
```

---

## Sessão 01/07/2026 — Soft-block de usuários (LGPD)

**Motivação:** deletar o perfil de um usuário (botão antigo "Delete") apagava a linha de `profiles` mas mantinha a conta de auth ativa e não tinha certeza sobre cascade em `purchases`/`user_product_access`. Trocado o fluxo padrão para **bloqueio reversível**, preservando histórico de compras/acessos (rastreabilidade — LGPD Art. 6, VI). O hard-delete continua disponível, mas rotulado como via de erradicação legal (LGPD/GDPR), não como ação de moderação do dia a dia.

### O que foi implementado
- `profiles.status` (`active`/`blocked`) + `blocked_at`, `blocked_reason`, `blocked_by` — trilha de auditoria de quem bloqueou, quando e por quê
- Trigger `prevent_self_privilege_escalation` no Postgres — impede que qualquer sessão (inclusive de um usuário já bloqueado) altere `status`/`role`/`is_admin`/`blocked_*` na própria linha, independente da política RLS configurada na tabela — defesa em profundidade contra auto-desbloqueio
- `getCurrentUserWithRole()` agora traz `status` no objeto do usuário
- `App.jsx` — gate central: `user.status === 'blocked'` (exceto super admin) renderiza `BlockedPage` em vez das rotas normais
- `BlockedPage.jsx` (novo) — tela dark theme "Account blocked" com botão de contato por email e sign out
- `AdminUsers.jsx` — badge vermelha "Blocked" na linha do usuário, botão Block/Unblock (ícone `Ban`), prompt opcional de motivo ao bloquear; super admin (`tejotao@gmail.com`) não pode ser bloqueado nem apagado pela UI
- Permissão `block` adicionada a `admin` e `super_admin` em `rolePermissions.js`

### ✅ Rodado no Supabase (01/07/2026)
- `sql/2026-07-01_user_block_status.sql` — coluna `status` + trigger anti-escalada
- `sql/2026-07-01_admin_update_profiles_rls.sql` — policy que faltava para admin conseguir dar UPDATE no perfil de outro usuário (sem ela, o botão Block dava 200 OK mas 0 linhas afetadas — bloqueio silenciosamente não acontecia)

### Bugs encontrados e corrigidos durante a validação
1. **RLS bloqueava o próprio recurso:** `profiles` só tinha policy de UPDATE para a própria linha (`auth.uid() = id`). Admin tentando bloquear outro usuário não dava erro, só não escrevia nada. Corrigido com policy adicional `is_admin_or_super()` (SECURITY DEFINER, evita recursão de RLS).
2. **Tela preta ao logar com conta bloqueada:** `BlockedPage` estava sendo renderizada em `App.jsx` **fora** do `<Router>`, e o componente `Logo` chama `useNavigate()` incondicionalmente → crash `useNavigate() may be used only in the context of a <Router>`. Corrigido movendo o gate `isBlocked` para dentro do `<Router>`, como alternativa às `<Routes>` normais.

### Limitações conhecidas (não resolvidas nesta sessão)
- **Sem enforcement em tempo real:** se um usuário já estiver com sessão aberta no dashboard quando for bloqueado, ele só é ejetado no próximo login (não há subscription realtime na tabela `profiles`)
- **Não é uma auditoria LGPD completa:** cobre accountability (quem/quando/por quê) e preserva o direito de eliminação (hard-delete continua existindo). Não cobre política de privacidade publicada, portabilidade de dados (export self-service) ou registro de consentimento — esses seguem como gaps separados, fora do escopo desta mudança
- ~~Email de contato divergente~~ **Resolvido em 01/07/2026:** padronizado `us@uffisolutions.com` como único email de contato em toda a plataforma. `uffisphere.com` só é mencionado em contexto legal (Terms/Privacy, como razão social "UffiSphere HTJS Ltd") e como link de parceiro no footer. Emails corrigidos: `Footer.jsx` (era `us@uffisphere.com`), `Terms.jsx`/`Privacy.jsx` (era `support@uffisolutions.com`), `ContactPage.jsx` (era `contact@uffisolutions.com`), `CTA.jsx`/`Contact.jsx` (era `uffisolutions@gmail.com` — domínio totalmente diferente). Os 2 últimos são componentes órfãos (não importados em nenhuma página ativa), corrigidos por consistência mesmo assim

### Sessão 01/07/2026 (cont.) — Rotas de Terms/Privacy conectadas
Descoberto durante a correção acima: os links "Terms of Service" e "Privacy Policy" do footer (`/termos`, `/privacidade`) **nunca estiveram registados em `App.jsx`** — caíam no catch-all e redireccionavam para `/`. Existiam 5 arquivos candidatos em `src/pages/` (resíduo de iterações antigas do template): `Terms.jsx`/`Privacy.jsx` (completos, UK GDPR, mencionam UffiSphere HTJS Ltd) vs `TermsPage.jsx`/`TermsOfService.jsx`/`PrivacyPage.jsx` (genéricos, incompletos). Conectadas as rotas usando `Terms.jsx` e `Privacy.jsx`. Os 3 arquivos genéricos continuam no repo, não usados — candidatos a limpeza futura, não apagados sem confirmação.

`Terms.jsx` e `Privacy.jsx` foram traduzidos de português para **inglês (UK)** a pedido do usuário — conteúdo legal fixo, fora do filtro de idioma do site.

**Nota de processo:** durante a validação apareceu um dialog de confirmação inesperado ("Unblock reallandbr@gmail.com?") numa aba de browser que tinha ficado aberta durante um restart do dev server. Investigado: rejeitado sem aceitar, e conferido no banco que `reallandbr` continuava com `status: active` — nenhuma alteração real ocorreu. Causa mais provável: estado JS obsoleto na aba (não recarregada entre matar/reiniciar o servidor), não um bug de aplicação. Lição: sempre abrir aba nova (ou recarregar) após reiniciar o dev server, em vez de reaproveitar uma aba antiga.

---

## Sessão 01/07/2026 (cont.) — Perfil do Usuário (modal CRUD self-service + admin)

**Motivação:** usuário pediu um modal de CRUD de perfil — sem foto (só iniciais), campos essenciais editáveis pelo próprio usuário (contato, endereço, data de nascimento), e um campo de classificação editável só pelo admin, junto com detalhes informativos (data de cadastro, etc.).

### Descobertas antes de implementar (via API direta + leitura de código)
- **A maioria dos campos já existia** em `profiles`: `phone`, `whatsapp`, `birth_date`, `address_street`, `address_number`, `postal_code`, `country`, `full_name`. Só faltavam `city`, `contact_preference` e `classification`.
- **CONTEXT.md documentava colunas que não existem de verdade**: `name`, `first_login`, `profile_image_url`, `language` — confirmado via erro `column does not exist`. Corrigido na secção 13 (schema de `profiles`) acima.
- **`src/pages/ProfilePage.jsx` e `src/components/auth/UserAvatar.jsx` são arquivos órfãos** de uma geração antiga do app (usam `AuthContext`/`useI18n`/coluna `user_id`, que não são o padrão real usado hoje). Não foram reaproveitados.
- **Gancho morto reativado**: `Header.jsx` linha 159 — "Account Settings" já fazia `navigate('/dashboard?tab=settings')`, mas ninguém lia esse parâmetro. Agora `UserDashboard.jsx` lê e abre o modal automaticamente.
- **Avatar era inconsistente em 4 lugares**, todos com 1ª letra do email (`Header.jsx`, `AdminLayout.jsx`, `AdminUsers.jsx`) ou tentando carregar uma foto real (`UserDashboard.jsx`). Padronizado pras 2 primeiras letras do **nome** (`getInitials()` em `src/lib/utils.js`), com fallback pro email se não houver nome.

### O que foi implementado
- `sql/2026-07-01_user_profile_fields.sql` — colunas `city`, `contact_preference`, `classification`; estendeu a trigger `prevent_self_privilege_escalation` (da feature de bloqueio) pra também proteger `classification` — usuário não pode setar a própria classificação nem via PATCH direto
- `getCurrentUserWithRole()` (`supabaseAuth.js`) agora também busca `full_name`, necessário pros avatares globais (Header/AdminLayout)
- `src/components/uffi/ProfileModal.jsx` (novo) — modal self-service: nome, telefone, whatsapp, preferência de contato, endereço completo, data de nascimento. Salva via `updateUser()` já existente (sem query nova)
- `src/components/admin/UserProfileModal.jsx` (novo) — modal admin: dados pessoais **somente leitura** + classificação editável (dropdown: VIP/Standard/Lead/Em risco/Inativo) + metadados (cadastrado em, último login, client code)
- `UserDashboard.jsx` — botão "Edit Profile" ao lado do nome + leitura de `?tab=settings`
- `AdminUsers.jsx` — botão "View Profile" (ícone `Contact`) por linha

### ✅ Testado e confirmado (01/07/2026)
- Avatar com iniciais do nome correto em 4/4 pontos (Header, AdminLayout, AdminUsers, UserDashboard)
- `ProfileModal`: carrega dados reais pré-preenchidos, salva e persiste corretamente (testado com endereço completo)
- `/dashboard?tab=settings` abre o modal automaticamente e limpa o parâmetro da URL depois
- `UserProfileModal`: exibe todos os dados formatados corretamente (datas, endereço concatenado)
- **Segurança validada:** tentativa de setar a própria `classification` via PATCH direto retorna erro 400 (`Not allowed to modify protected fields on your own profile`) — bloqueado mesmo para super admin tentando alterar a si mesmo; UI trata o erro graciosamente (toast, modal não fecha, sem crash)
- Build e lint limpos (2393 módulos)

### Nota — dados de teste limpos pelo usuário
Durante a sessão, o usuário removeu manualmente as contas de teste (`reallandbr`, `joselito.tesseroli`, `uffiservice`) e produtos de teste direto no Supabase — não relacionado a nenhuma mudança de código desta sessão. Restou só `tejotao` (super admin) pra testar; o caminho "admin classifica outro usuário" não foi testado ao vivo por falta de uma segunda conta, mas reaproveita exatamente o mesmo `updateUser()` + policy `is_admin_or_super()` já validado na feature de bloqueio.

---

## Sessão 01/07/2026 (cont.) — Auditoria de responsividade (mobile/tablet/desktop)

**Motivação:** usuário reportou o modal "My Profile" cortando o cabeçalho, e pediu revisão de responsividade em todo o sistema. Escopo definido com o usuário: todas as telas por prioridade (público → dashboard → admin), corrigindo problemas reais conforme encontrados.

### Bug raiz encontrado (afetava 6 modais no app inteiro)
O cabeçalho do "My Profile" não estava sendo cortado por scroll — era **z-index empatado** com as barras de navegação fixas. Todo modal usava `z-50`, exatamente igual às barras fixas (`UserDashboard.jsx` top bar, `AdminLayout.jsx` header, `Header.jsx` público), todas também `z-50`. Como as barras vêm depois no DOM, elas pintavam por cima do topo do modal.

**Tentativa intermediária que não resolveu sozinha:** adicionar `overflow-y-auto` ao wrapper do modal com `items-center` — é um bug conhecido do CSS flexbox (centralizar + overflow não revela conteúdo que ultrapassa por cima em vários browsers).

**Correção final aplicada em 6 arquivos** (`ProfileModal.jsx`, `UserProfileModal.jsx`, `AdminUsers.jsx` GrantModal, `AdminCategories.jsx`, `RegisterPage.jsx`, `LoginPage.jsx` ×2):
- `z-50` → `z-[60]` (acima das barras fixas `z-50`, abaixo dos toasts `z-[100]`)
- `items-center` → `items-start` (elimina o bug de clipping por cima, ao custo de não ficar 100% centralizado quando o conteúdo é curto)
- Adicionado `overflow-y-auto` no wrapper externo
- `AccessModal.jsx` já estava correto (`z-[200]`, `items-end sm:items-center`) — não precisou de ajuste, serviu de referência pro padrão certo

### Bug real encontrado — Access Board (Kanban) ilegível no mobile
As colunas "Products" e "Users" ficavam lado a lado mesmo em telas de 390px, cortando texto (`"T..."`, `"te..."`) e tornando a tela inutilizável no celular. Corrigido em `AccessBoard.jsx`:
- Container flex: `flex` → `flex flex-col lg:flex-row` (empilha abaixo de 1024px)
- Coluna Products: `w-72` fixo → `w-full lg:w-72` + `max-h-[40vh] lg:max-h-none` + borda muda de direita pra baixo no mobile
- Coluna Users: adicionado `min-h-0` (necessário pro scroll interno funcionar corretamente dentro de flex-col)
- Testado em 390px, 768px e 1024px — empilha no mobile/tablet, lado a lado a partir de `lg` (1024px), sem regressão

### Testado e aprovado sem alterações necessárias
- Home, Login, Register, Products (site público) — mobile/tablet/desktop
- User Dashboard — mobile (incluindo modal de perfil corrigido)
- Admin Dashboard, Admin Categories, Admin Users — mobile (sidebar vira drawer hamburger, cards empilham em 1 coluna)
- `AdminProducts.jsx` — já tinha `overflow-x-auto` + colunas `hidden md:table-cell`/`hidden sm:table-cell` para a tabela; nenhuma mudança necessária

### Gaps conhecidos (não testados)
- Catálogo estava vazio durante a sessão (usuário limpou produtos de teste) — não foi possível validar o grid de cards de produtos nem a página `ProductDetail` (`/products/:id`) com dados reais
- Build e lint limpos (2393 módulos)

---

## Sessão 01/07/2026 (cont.) — Modal de Categorias: nomes por idioma + color picker

**Descoberta crítica antes de implementar:** a tabela `categories` não tinha colunas `name` nem `description` — confirmado via REST (`column categories.name does not exist`). O modal de criar/editar categoria já estava **quebrado** (salvar sempre falhava) antes desta sessão, independente do pedido de i18n. Colunas reais existentes: `id, slug, icon, color, sort_order, active, created_at`. O nome exibido nos cards/catálogo vem de uma tabela separada `category_translations` (join por idioma), não documentada até agora no CONTEXT.md — **não foi alterada** nesta sessão.

### SQL rodado no Supabase
`sql/2026-07-01_category_names_i18n.sql`:
```sql
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS name_pt TEXT,
  ADD COLUMN IF NOT EXISTS name_it TEXT,
  ADD COLUMN IF NOT EXISTS name_es TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT;
```

### O que foi implementado
- `AdminCategories.jsx`: Nome (EN) obrigatório com slug 100% automático (gerado a cada tecla, sem botão manual); Nome (PT-BR)/Nome (IT)/Nome (ES) opcionais; color picker nativo (`input type="color"`) + campo hex editável + preview, substituindo as bolinhas de cor fixas; ícone (emoji grid) e slug/descrição/ativo mantidos como estavam
- `catalogQueries.js` → `fetchAllCategories`: passou a também selecionar `name, name_pt, name_it, name_es, description` e retorna como `name_en/name_pt/name_it/name_es/description_raw`, usados só para pré-preencher o modal ao editar — os campos `name`/`description` já existentes (derivados de `category_translations`) continuam iguais para todo o resto do app

### Escopo — o que essas colunas NÃO fazem (ainda)
Os nomes por idioma salvos aqui **não aparecem** em nenhum outro lugar do site (cards de produto, filtros, catálogo público) — tudo isso continua lendo de `category_translations`. Isso foi mantido intencionalmente por instrução explícita do usuário ("não altere nenhum outro componente/tabela"). Se no futuro quiser que esses nomes apareçam de fato no site, é preciso migrar as leituras de `category_translations` para essas colunas novas (ou popular `category_translations` a partir delas).

### ⚠️ Incidente de teste — mutação real não intencional (corrigida)
Durante a validação em browser, uma categoria (`nichos-hobby`) foi alterada sem clique deliberado — slug virou `hobby`, cor mudou de `#34a853` para `#d37b55`, `name`/`description` foram preenchidos. Hipótese: cliques/teclas de uma sessão de teste anterior (Users) ficaram enfileirados e foram entregues com atraso após a navegação para Categories, coincidindo com posições de elementos (botão Editar → color picker → possivelmente Salvar). **Revertido manualmente** via API (slug, cor, ícone restaurados; name/description voltaram a `null`) e confirmado que as outras 4 categorias não foram afetadas. Não é um bug do código do app. Lição: após qualquer troca de página/reload do servidor, aguardar (`wait_for`) e tirar um snapshot limpo antes de interagir — não confiar em cliques imediatos após navegação.

### ✅ Testado e confirmado
- Criar categoria com nome EN + PT + IT + ES + cor via hex — salvou corretamente
- Slug gerado automaticamente a cada tecla no campo Nome (EN)
- Editar reabre modal com todos os campos pré-preenchidos corretamente (incluindo cor)
- Excluir categoria de teste — removida sem deixar resíduo
- Build e lint limpos (2391 módulos)

---

## Sessão 01/07/2026 (cont.) — Badge "Pending" removido do Admin Users (quebrado)

O badge de confirmação de email ("Confirmed"/"Pending") ao lado de cada usuário sempre mostrava **"Pending" para todo mundo**, inclusive para `tejotao`. Causa: `AdminUsers.jsx` lia `u.email_confirmed_at` da tabela `profiles`, mas essa coluna **não existe** lá — confirmado via REST (`column profiles.email_confirmed_at does not exist`). Esse campo só existe em `auth.users` (Supabase Auth), inacessível pela chave pública usada no frontend. Removido o badge (`AdminUsers.jsx`) por não ser confiável; nenhuma outra funcionalidade dependia dele. Ver nota no Roadmap (`17. Glossário` / secção 16, item Assinaturas) sobre reaproveitar esse espaço de UI para status de assinatura/pagamento quando o produto de membro for desenhado.

---

## Sessão 02/07/2026 — Migração Cloud-First (Vercel) + Auditoria de Segurança RLS completa

**Motivação:** ambiente de desenvolvimento local parou de responder (`npm run dev` — página em branco, requisição HTTP nunca completava). Decisão: pausar o debug local e migrar o workflow para Cloud-First via Vercel, com auditoria de segurança do banco antes do primeiro deploy público real.

### Diagnóstico do travamento local (root cause identificada, não resolvido)
- Causa raiz: o processo nativo do `esbuild` (usado pelo Vite para pre-bundling de dependências) trava indefinidamente, bloqueado num `read()` de sistema esperando dados de um pipe que o processo Node/Vite nunca entrega — confirmado com o profiler `sample` do macOS (thread principal presa em `read()`/`libsystem_kernel.dylib`).
- Descartado como causa: processos `vite`/`build` órfãos concorrentes rodando havia 30+ minutos, cache `.vite` corrompido, versão do Node (testado Node 24.16 e Node 22 via `nvm`), binário `esbuild` corrompido (reinstalado do zero via `npm install esbuild @esbuild/darwin-arm64`), antivírus/EDR/firewall (nenhum encontrado no sistema), Gatekeeper (sem entradas suspeitas no log unificado do macOS).
- **Confirmado que o travamento também ocorre no terminal real do usuário**, fora do ambiente de execução do assistente — não é artefato de sandbox, é um problema genuíno da máquina (macOS 26.5.1, build beta/recente).
- **Sem solução aplicada.** Próximos passos sugeridos e não testados: reinstalar as Ferramentas de Linha de Comando do Xcode (`xcode-select --install`), ou seguir usando o Node 22 já instalado via `nvm use 22`.
- Impacto prático: hoje não há como rodar/testar o app localmente. Todo o fluxo de desenvolvimento é commit → push → deploy automático na Vercel, sem preview local. Para testar antes de ir pro `main`, a alternativa é dar push num branch separado — a Vercel gera uma URL de Preview isolada da produção.

### Auditoria de segurança RLS (Supabase) — antes do primeiro deploy público
Descoberta inicial (via Table Editor do Supabase): várias tabelas de produção estavam com **RLS completamente desligada**, badge "Unrestricted" — exposição total via `anon key` pública embutida no bundle JS: `admin_roles`, `orders`, `favorites`, `notifications`, `user_courses`, `categories`, `category_translations`, `product_translations`, `products`, `purchases`.

Trabalho realizado, tabela por tabela:
1. **`profiles`** — removidas 2 policies de UPDATE duplicadas e uma policy de SELECT (`"Ver perfis autenticados"`) que deixava qualquer usuário logado ler todos os perfis (email, role, etc. de terceiros). INSERT estava sem nenhuma restrição (`with_check = true` pra role `public`, incluindo `anon` — qualquer um podia inserir uma linha de perfil com `role = 'super_admin'`). Corrigido com `profiles_insert_own` / `profiles_update_own` / `profiles_select_admin` + trigger `prevent_self_role_escalation` (bloqueia usuário comum de alterar a própria `role`/`status` via UPDATE — `WITH CHECK` sozinho não protege coluna individual, só a condição de dono da linha).
2. **Tier 1 sensível** (`admin_roles`, `orders`, `favorites`, `notifications`, `user_courses`) — RLS ligada + policies: leitura restrita ao dono (`auth.uid() = user_id`) ou admin; **gravação bloqueada para usuário comum** em `orders`/`notifications`/`user_courses` (evita fraude: pedido "pago" sem pagar, notificação falsa injetada na conta de terceiro, curso liberado de graça).
3. **`purchases`** — já tinha 3 policies desenhadas mas RLS nunca tinha sido ligada. Unificado o critério de "é admin": a policy antiga usava `profiles.is_admin` (coluna legada), substituída por `is_admin_or_super()` (mesmo critério usado no resto do banco) — confirmado sem divergência entre `is_admin` e `role` antes da troca.
4. **Catálogo** (`categories`, `category_translations`, `product_translations`, `products`) — leitura pública só de linhas com `active = true`, escrita só admin. `product_translations` e `products` tinham policies antigas com `qual = true` (liberava tudo, inclusive rascunho não publicado) — a de `products` foi substituída; a de `product_translations` foi deixada de propósito por decisão do usuário (baixo risco, tabela só tem texto, sem dado sensível).
5. **Revisão das 7 tabelas que já tinham RLS ligada** — achado crítico: `product_deliverables` (tabela real de entrega de conteúdo — colunas `url`, `provider`, `type`, `is_active`, `go_unlisted_at`, usada pela automação de YouTube/Drive/Vimeo) tinha uma policy `"Authenticated read deliverables"` com `auth.role() = 'authenticated'` — **qualquer usuário com conta lia o link de entrega de qualquer produto, sem ter comprado**. Corrigida para exigir `EXISTS` em `user_product_access` (única das 5 tabelas candidatas — `purchases`/`orders`/`user_courses`/`user_course_access`/`user_product_access` — com dado real em produção; as outras 4 têm 0 linhas, são schemas legados de iterações anteriores).

**Pendências não-bloqueantes registradas, não corrigidas nesta sessão:**
- `course_content` valida acesso contra `purchases` (0 linhas) em vez de `user_product_access` (fonte real) — provável bug funcional a testar quando `course_content` entrar em uso.
- Coluna legada `profiles.is_admin` (booleana) ainda referenciada ao lado de `role` em policies de `course_content`/`user_course_access` — hoje sincronizados, mas vale consolidar num critério só.
- `product_deliverables_select_purchased` (o trigger de auto-escalação de `profiles`) — teste via simulação de sessão (`SET LOCAL request.jwt.claims`) deu resultado ambíguo no SQL Editor; não foi refeito o teste real pelo navegador (usuário comum logado tentando `UPDATE profiles SET role='admin'`).
- `user_product_access` tinha 2 policies de SELECT duplicadas (mesma condição) — inofensivo, não limpo.

### Deploy Vercel
- `src/lib/supabaseClient.js` — removida URL/anon key hardcoded no código-fonte, migrado para `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, com `throw` explícito se alguma faltar.
- `vercel.json` criado (rewrites de SPA para o React Router funcionar em rotas profundas tipo `/dashboard`, `/products/:id`).
- `package.json` — `engines.node: "20.x"` adicionado.
- Env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) configuradas no painel da Vercel (Production/Preview/Development).
- **Primeiro deploy falhou** com `Could not resolve "./plugins/..."`: a pasta `plugins/` (usada pelo `vite.config.js` para os plugins de dev — visual editor, edit mode, iframe route restoration, selection mode) nunca tinha sido commitada no git, junto com `src/pages/BlockedPage.jsx`, `src/components/uffi/ProfileModal.jsx` e `src/components/admin/UserProfileModal.jsx` — todos importados ativamente no app mas nunca versionados. O `main` no GitHub estava um dia inteiro desatualizado em relação ao disco (22 arquivos modificados + 20 novos nunca commitados). Corrigido com um commit único trazendo 42 arquivos (`68e095a`) — build passou, deploy confirmado funcionando via teste com navegador real (zero erros de console, home renderizando completa com hero, produtos, navegação, seletor de idioma).
- **Domínio customizado conectado**: `www.uffisolutions.com` (+ apex `uffisolutions.com`) apontado via DNS na Vercel, certificado SSL emitido automaticamente — confirmado no ar pelo usuário.

### Dados
- 6 categorias criadas em produção via SQL direto no Supabase (pós-deploy).

### Arquivamento de documentação
Movidos para `docs/archive/` (documentos de auditoria de sessões anteriores, desatualizados frente ao estado real confirmado nesta sessão): `AUDIT_CHECKLIST.md`, `AUDIT_FINAL_REPORT.md`, `AUTHENTICATION_AUDIT.md`, `DATABASE_AUDIT_RESULTS.md`, `MAGIC_LINK_DIAGNOSIS.md`, `NAVIGATION_AUDIT_COMPLETE.md`, `NAVIGATION_AUDIT_RESULTS.md`, `RELATÓRIO_FINAL.md`, `SUPABASE_AUDIT_REPORT.md` (documentava a integração Supabase como "bloqueada/não autenticada" — obsoleto desde que a conexão real foi estabelecida), `SUPABASE_SETUP_CHECKLIST.md` (schema de 13 tabelas planejado que diverge bastante do schema real confirmado hoje), `SYSTEM_AUDIT_FINAL_REPORT.md`, `TECHNICAL_DOCUMENTATION.md`, `TRANSLATION_AUDIT_COMPLETE.md`, `TRANSLATION_AUDIT_RESULTS.md`.

**Não movidos** (fora do escopo desta limpeza, decisão pendente do usuário): `EMAIL_TEMPLATES.html` (não é documento de auditoria, é referência ativa) e `"uffisolutions-v1.0-28jun2026 codigo Horizons"` (arquivo de 473KB sem extensão clara, não referenciado por nenhum import do código — recomendado o usuário verificar o conteúdo antes de decidir manter, arquivar ou remover).

### Fix pós-deploy: recuperação de senha caindo direto no dashboard (sem trocar senha)
Teste real do fluxo "esqueci minha senha": o link do email logava o usuário direto no dashboard, sem nunca pedir a nova senha — funcionando como um magic link, não como reset. Causa provável: o Site URL / Redirect URLs do Supabase (Authentication → URL Configuration) ainda não incluíam o domínio novo (`www.uffisolutions.com`), então o `redirectTo: /reset-password` era ignorado e o Supabase mandava pro Site URL padrão (`/`) — como a sessão de recuperação já autentica, cair em `/` com `user` truthy dispara o redirect normal pro `/dashboard`.

`ResetPasswordPage.jsx` já estava correto (exige senha nova, mínimo 6 caracteres, com confirmação, antes de liberar). Adicionada uma camada de defesa em profundidade em `App.jsx`: novo estado `isPasswordRecovery`, ligado no evento `PASSWORD_RECOVERY` do Supabase — força a tela de trocar senha por cima de qualquer rota, independente de onde o navegador aterrissou; desliga sozinho no evento `USER_UPDATED` (senha trocada com sucesso), devolvendo o app ao fluxo normal de rotas. Não substitui o ajuste no painel do Supabase (fica como pendência do usuário, feito fora do código), é complementar.

Commit `5362d90`, testado em produção, zero erro de console.

---

## Sessão 03/07/2026 — Slugs amigáveis de produto + página "My Library"

### URLs de produto: UUID → slug
`ProductDetail.jsx` já sabia buscar por `slug` OU `id` (`p.id === id || p.slug === id`) — o problema era só que os 3 lugares que montam o link (`HomePage.jsx`, `ProductsPage.jsx`, produtos relacionados em `ProductDetail.jsx`) usavam `product.id`. Trocados os 3 pontos pra `product.slug || product.id` (fallback preserva compatibilidade com qualquer link antigo por UUID).

`AdminProducts.jsx` já gerava slug automaticamente a partir do nome, mas sem garantia de unicidade (dois produtos com nome parecido colidiriam na coluna `UNIQUE`). Corrigido: `makeUniqueSlug()` gera `nome-slugificado` + sufixo aleatório de 6 caracteres, sempre. Também corrigido um bug latente: o slug era regenerado a cada edição (não só na criação) — significava que editar o nome de um produto já publicado trocava a URL dele, quebrando link já compartilhado. Agora o slug só é gerado no create; update nunca toca nele.

### Nova página `/library`
Pedido do usuário: em vez do modal por produto (`AccessModal`), uma página agregada mostrando tudo que o usuário já desbloqueou, organizada por **tipo de entregável** (não por produto) — um produto com só 1 PDF aparece só na seção de PDFs, sem seções vazias pros tipos que não tem.

Reaproveita a mesma lógica de "fonte de verdade" de acessos já usada no `UserDashboard.jsx` (`purchases` + `user_product_access`, excluindo o legado `profiles.product_access`) e a mesma renderização por tipo do `AccessModal.jsx` — `DeliverableItem` e `ExpiryIndicator` foram exportados de lá (antes só usados internamente) especificamente pra esse reuso, sem alterar o comportamento do modal em si.

Conteúdo da página:
- Stats básicas: total de produtos desbloqueados, contagem por tipo de entregável (só os tipos que o usuário realmente tem), produtos expirando em ≤7 dias
- Banner discreto "New on the platform": últimos 3 produtos cadastrados na plataforma (`fetchAllProductsAllLanguages()`, sem filtro de idioma nem de propriedade — é vitrine, não conteúdo do usuário)
- Seções por tipo (PDFs/Videos/Audio/Google Drive/etc.), cada item mostrando o nome do produto de origem
- Rodapé de suporte discreto: "Need any support? us@uffisolutions.com"

Rota `/library` registrada em `App.jsx` (protegida, mesmo padrão do `/dashboard`), entrada de navegação adicionada no topbar do `UserDashboard.jsx` (ícone `Library`, ao lado de Home/Catalog).

### AccessModal retirado de circulação (mantido como módulo compartilhado)
Depois de ver a página nova funcionando, o usuário pediu pra desativar o modal por completo e deixar só a `/library`. Todos os pontos que abriam `AccessModal` (`UserDashboard.jsx` — cards de produto; `ProductDetail.jsx` — botão "Access Content" e auto-claim de produto grátis) agora fazem `navigate('/library')` em vez de abrir o modal. O arquivo `AccessModal.jsx` **não foi apagado** — continua sendo o módulo fonte de `DeliverableItem`/`ExpiryIndicator`/`groupDeliverablesByType`/`resolveDeliverables` usados pela `/library`. Limpeza acompanhante em `ProductDetail.jsx`: removido o fetch de deliverables (que ficou morto) e o estado `accessProduct`; import `motion`/`AnimatePresence` também removido (já estava sem uso antes desta mudança).

### Testado e confirmado em produção (navegador real, cliques reais)
- `/products/personal-shopper-internacional` carrega pelo slug, zero erro
- `/library` renderiza stats/banner/seções corretas com o único produto real hoje (1 PDF, 1 áudio, 1 Google Drive)
- Clique em "Access" no dashboard e em "Access Content" no `ProductDetail` — ambos navegam pra `/library`, nenhum modal abre

Commits: `ed81da1` (slugs + Library), `b18e7c4` (retirada do modal).

### Pendente (revisado — ver sessão seguinte)
Só existe 1 produto cadastrado na plataforma até agora — o layout da `/library` (e o comportamento do banner "New on the platform" com mais de 3 produtos, várias seções de tipo ao mesmo tempo, etc.) ainda não foi visto com catálogo maior. Usuário vai cadastrar mais produtos e reavaliar o visual antes de qualquer ajuste fino.

### Fix: link previews mostrando "Hostinger Horizons" em vez de UffiSolutions
Ao compartilhar o link do site (WhatsApp, Telegram, LinkedIn), a prévia vinha com "Hostinger Horizons". Causa: esses bots de preview leem o HTML puro do `index.html`, sem executar JavaScript — então nunca viam o `<title>`/descrição que o `Helmet` define via React, só o que estava fixo no arquivo. O `index.html` tinha `<title>Hostinger Horizons</title>` fixo, **zero tags Open Graph/Twitter Card**, e o favicon apontava pra `/vite.svg` — arquivo que nem existe (404, sobra do template padrão do Vite).

Corrigido: título fixo atualizado, adicionadas tags `og:*`/`twitter:*` completas, e favicon trocado pra apontar pra logo real do site (mesma URL já usada no Header/Footer) em vez do `public/favicon.svg` que existia no repo mas era um design de bandeira do Reino Unido não relacionado à marca. Confirmado via `curl` direto na produção que o HTML puro retorna tudo certo agora.

Commit `021ac3f`.

---

## Sessão 03/07/2026 (cont.) — Library refeita: de "biblioteca agregada" pra página por produto

**Motivação:** a versão anterior da `/library` (agregando todos os produtos desbloqueados numa única página, com stats e banner "recém-adicionados") ficou poluída na prática assim que testada — usuário pediu pra simplificar radicalmente: uma página por produto, chamada a partir de cada botão "Access", sem estatísticas.

### Novo desenho
- Rota mudou de `/library` (agregada) pra **`/library/:productId`** (aceita slug ou UUID, mesmo padrão de fallback do `ProductDetail.jsx`)
- Cada clique em "Access" (cards do `UserDashboard.jsx`) ou "Access Content" (`ProductDetail.jsx`, incluindo o fluxo de auto-claim de produto grátis) agora navega pra `/library/{slug-ou-id-do-produto-clicado}` — antes ia todo mundo pra uma `/library` genérica
- Removido do topbar do `UserDashboard.jsx` o ícone/botão genérico "My Library" — não fazia mais sentido sem destino fixo (a lista de produtos desbloqueados já é o próprio dashboard)
- Página nova: imagem pequena do produto + título + chip de categoria, fundo com gradiente radial suave usando a cor da categoria (não mais fundo neutro), lista **plana** de entregáveis (sem cabeçalhos de seção por tipo) ordenada por `created_at` decrescente (mais recente primeiro) — cada item ainda usa o `DeliverableItem` já existente (mesmos players de áudio/vídeo nativo, embeds de YouTube/Vimeo/Spotify com thumbnail, etc.), só sem o agrupamento visual por tipo
- Cada entregável ganhou um link discreto "Give feedback on this" (`mailto:us@uffisolutions.com`, assunto pré-preenchido com produto + nome do entregável) — decisão explícita do usuário: versão simples via email do cliente, sem form/backend novo
- Estado de "sem acesso" tratado na própria página (usuário loga, mas não tem esse produto → mensagem + botão pra ver a página pública do produto) em vez de assumir que quem chega ali sempre tem acesso

**Adiado por decisão do usuário** (não bloqueante, considerar depois): marcar entregável como "visto" por usuário — precisaria de tabela nova, ainda não existe em lugar nenhum do sistema.

Commit `49720ff`.

### Incidente: travamento de baixo nível do git na pasta local (mesma classe do travamento do esbuild)
Durante o commit desta mudança, `git commit`/`git push`/até `git log -1`/`cat` num objeto de 375 bytes dentro de `.git/objects/` começaram a travar indefinidamente na pasta local do projeto — confirmado via `sample` (processo preso em `mmap()`/`read()` do kernel, não em lógica do próprio git). `brctl` (daemon de iCloud) negou acesso, e um `ls` direto na pasta `Documents` (não no projeto) retornou "Operation not permitted" — indício de alguma interação de sandbox/iCloud nessa máquina, mesma característica geral do travamento do `esbuild` do início do dia, mas agora afetando o git.

**Contornado**: clonado o repositório do zero num diretório temporário limpo, copiados os arquivos modificados pra lá, commit e push feitos de lá com sucesso — sem tocar no objeto travado. **A pasta original (aberta no VS Code do usuário) continuou com o git travado** ao final desta sessão; os arquivos de código nela estão corretos (foram editados diretamente ali), só o histórico do git local ficou desatualizado. Recomendado ao usuário reiniciar o VS Code ou a máquina antes do próximo `git pull` por lá.

---

## Sessão 04/07/2026 — Perfil: ajuste de UX na classificação (admin) + Integração Stripe (liberação automática de acesso)

### Perfil — classificação do admin não podia ser testada contra a própria conta
Ao revisar `UserProfileModal.jsx` (feature já implementada em 01/07/2026), identificado que a trigger `prevent_self_privilege_escalation` bloqueia — corretamente, por design — o próprio admin de alterar sua própria `classification`. Como o botão "View Profile" (`AdminUsers.jsx`) não distinguia a própria conta das demais, o admin podia abrir o próprio perfil, escolher uma classificação e tomar um erro genérico ao salvar, sem entender o motivo.

**Corrigido**: `AdminUsers.jsx` agora passa `isSelf={profileTarget.id === user?.id}` pro `UserProfileModal`; quando `isSelf`, o dropdown e o botão "Save Classification" ficam desabilitados com nota "You cannot classify your own account." O catch de erro também passou a detectar a mensagem específica da trigger (`protected fields`) e mostrar "You cannot set your own classification" em vez do genérico "Error updating classification".

### Descoberta importante: páginas de "curso" são órfãs
Ao investigar onde conectar o Stripe, descoberto que **`ProductDetail.jsx` (rota `/products/:id`) é o único fluxo de compra realmente em uso**. `ProductCard.jsx`, `CourseCard.jsx`, `CourseDetailPage.jsx`, `CourseCheckoutPage.jsx`, `ProductPage.jsx` e `ClientView.jsx` navegam para rotas `/course/:slug` e `/produto/:slug` que **não existem** em `App.jsx` (caem no catch-all) — resíduos órfãos de uma iteração antiga do template, mesmo padrão já visto em `ProfilePage.jsx`/`UserAvatar.jsx`. Não apagados, só não tocados nesta mudança.

### Stripe — liberação automática de acesso após pagamento
**Motivação:** até agora, comprar só abria o Payment Link do Stripe; a liberação de acesso dependia de um admin usar o `GrantModal` manualmente depois. Objetivo: fechar o laço sozinho via webhook.

**Implementado:**
- `sql/2026-07-04_stripe_access_release.sql` — nova coluna `products.access_duration_days` (INTEGER, NULL = acesso vitalício). Duração configurável **por produto**, não fixa.
- `AdminProducts.jsx` — novo campo "⏳ Access Duration (days)" no formulário do produto, ao lado do link do Stripe.
- `ProductDetail.jsx` (`handleBuy`) — agora exige login (mesmo padrão do `handleFreeAccess`) e anexa `client_reference_id=<userId>:<productId>` + `prefilled_email=<email>` na URL do Payment Link antes de abrir (Stripe repassa esses parâmetros pra Checkout Session e pro webhook).
- `api/stripe-webhook.js` (novo, Vercel Serverless Function, detectada automaticamente por estar em `/api`) — valida assinatura (`STRIPE_WEBHOOK_SECRET`), escuta `checkout.session.completed`, lê `client_reference_id`, busca `access_duration_days` do produto, calcula `expiry_date` e faz upsert em `user_product_access` (mesmo formato usado por `grantProductAccess()` em `accessQueries.js`) usando a Supabase **service role key** (bypassa RLS — não precisou de policy nova). Também grava um registro em `purchases` para auditoria (reaproveita as colunas já usadas por `createPurchase()` em `purchaseQueries.js`), de forma não-bloqueante.
- Nova dependência: `stripe` (SDK Node oficial) — `package.json`.

**Env vars novas, server-only (sem prefixo `VITE_`, não podem ir pro bundle do client):** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`.

### ⏳ Pendente (não concluído nesta sessão)
- Usuário ainda precisa: (1) pegar `STRIPE_SECRET_KEY` no dashboard do Stripe, (2) criar o webhook endpoint no Stripe apontando pra URL do deploy + evento `checkout.session.completed` (gera o `STRIPE_WEBHOOK_SECRET`), (3) pegar `SUPABASE_SERVICE_ROLE_KEY` no Supabase, (4) colar as 3 nas env vars do Vercel (e `.env.local` se for testar local), (5) rodar a migration no Supabase.
- Teste ponta a ponta em modo teste do Stripe ainda não feito (depende dos passos acima + deploy — `/api` não roda no `vite dev` local, só depois de deployado ou via `vercel dev`).
- Reembolso/estorno não tratado (não revoga acesso automaticamente) — não pedido nesta rodada.

### Sessão 04/07/2026 (cont.) — Deploy do webhook + descoberta de dois projetos Vercel duplicados

**Commit/push:** o repositório local desta pasta estava com o mesmo travamento de baixo nível já documentado (git preso em `mmap()`/`read()` do kernel — `git fetch` travou 2min+, sem uso de CPU real). Contornado de novo clonando o repo limpo numa pasta temporária, copiando os arquivos alterados pra lá, e commitando/pushando de lá (commit `366f24f`, mensagem "feat: Stripe webhook auto-releases product access after payment"). Aproveitado pra também subir `engines.node` de `20.x` pra `22.x` no `package.json` (Vercel avisou depreciação do Node 20 a partir de 01/10/2026).

**Descoberta crítica: dois projetos Vercel diferentes conectados ao mesmo repo `tejotao/uffisolutions`, branch `main`:**
- **`uffisolutions`** (`uffisolutions.vercel.app`) — criado por `tejotao`. Depois do push, a função `/api/stripe-webhook` chegou a ficar no ar mas crashava com `FUNCTION_INVOCATION_FAILED` (500) em toda requisição — sintoma de env var faltando/errada nesse projeto especificamente (provavelmente `VITE_SUPABASE_URL` ou a `SUPABASE_SERVICE_ROLE_KEY`, quebrando o `createClient()` logo na inicialização do módulo). Não foi depurado a fundo — decidido descontinuar esse projeto em vez de consertar.
- **`uffisolutions-c549`** (`www.uffisolutions.com`, domínio de marca real) — criado por `uffisphere`. Já ficou 100% funcional depois do push: testado via `curl` direto (`GET` → 405, `POST` sem assinatura → `400 Webhook Error: No stripe-signature header value was provided.`, exatamente o comportamento esperado do código).

**Decisão do usuário: `uffisolutions-c549`/`www.uffisolutions.com` é o projeto oficial de produção.** Ações tomadas:
- Webhook do Stripe (sandbox) reapontado de `uffisolutions.vercel.app` pra `www.uffisolutions.com/api/stripe-webhook` (mesmo endpoint, só trocada a URL — o signing secret não muda ao editar a URL de um destino existente).
- Git **desconectado** do projeto `uffisolutions` (Project Settings → Git → Disconnect) — ele para de receber deploy automático a cada push, mas **não foi apagado** (domínio/deployments antigos continuam no ar do jeito que estavam, caso algo externo ainda dependa deles — ex: redirect URLs do Supabase Auth, links antigos de email). Decisão consciente de não deletar ainda, por ser irreversível; reavaliar depois de um tempo sem problemas.

**Diagnóstico adicionado ao webhook** (`api/stripe-webhook.js`): logs explícitos (`console.log`/`console.error`) do `client_reference_id` recebido e do resultado do upsert em `user_product_access`, incluindo aviso específico quando o upsert afeta 0 linhas sem lançar erro — sintoma clássico de RLS bloqueando silenciosamente por causa de uma service role key ausente/errada (mesmo padrão de bug já visto na feature de bloqueio de usuário).

### ⏳ Ainda pendente (na época)
- Investigar (opcional, sem pressa) por que `uffisolutions.vercel.app` crashava — só relevante se decidirem reviver esse projeto no futuro.
- Confirmar que nada depende do domínio `uffisolutions.vercel.app` antes de considerar apagar o projeto de vez (checar Supabase Auth redirect URLs, `EMAIL_TEMPLATES.html`, links de marketing antigos).

---

## Sessão 04/07/2026 (cont.) — Stripe: ✅ ponta a ponta funcionando (3 bugs encontrados e corrigidos)

**Resultado final: testado e confirmado em produção (`www.uffisolutions.com`)** — compra real no sandbox do Stripe → webhook → linha criada em `user_product_access` com `user_id`/`product_id` corretos, `granted_by: NULL` (grant automático, não manual) — produto aparece desbloqueado no Dashboard do comprador.

O caminho até aqui exigiu depurar **3 bugs em cadeia**, cada um mascarando o próximo (cada correção revelava um novo erro diferente na tentativa seguinte):

### Bug 1 — `client_reference_id` descartado silenciosamente pelo Stripe
`ProductDetail.jsx` montava `client_reference_id` como `${user.id}:${product.id}` (dois-pontos como separador). Stripe só aceita `client_reference_id` com caracteres alfanuméricos, hífen ou underscore — **qualquer outro caractere faz o valor inteiro ser descartado, sem erro nenhum** (nem no Stripe, nem no navegador). O webhook sempre recebia `client_reference_id: null` e rejeitava com 400 "Missing client_reference_id". Não era cache do navegador (testado em aba anônima e no Safari, mesmo resultado) — só foi descoberto ao pesquisar a documentação oficial do Stripe sobre URL parameters de Payment Links.
**Correção:** separador trocado pra underscore (`${user.id}_${product.id}`) em `ProductDetail.jsx` e no parser do webhook (`api/stripe-webhook.js`, `.split('_')` em vez de `.split(':')`). Seguro porque UUIDs nunca contêm underscore, só hífen.

### Bug 2 — Migration nunca rodada no banco real
Depois do bug 1 corrigido, o webhook passou a receber `client_reference_id` certo, mas começou a dar **500** com `code: '42703', message: 'column products.access_duration_days does not exist'`. A migration `sql/2026-07-04_stripe_access_release.sql` (criada na sessão anterior) nunca tinha sido executada no SQL Editor do Supabase — só existia como arquivo no repo.
**Correção:** usuário rodou o `ALTER TABLE products ADD COLUMN IF NOT EXISTS access_duration_days INTEGER;` direto no SQL Editor.

### Bug 3 — Chave errada no Vercel (a suspeita original, confirmada por último)
Com as duas primeiras causas corrigidas, sobrou um terceiro erro: `code: '42501', message: 'new row violates row-level security policy for table "user_product_access"'`. Isso só acontece quando a role usada **não é** `service_role` — porque `service_role` sempre ignora RLS por definição, sem exceção. A variável `SUPABASE_SERVICE_ROLE_KEY` no Vercel (`uffisolutions-c549`) estava com o valor errado (provável troca com a chave `anon`, que fica visualmente ao lado no painel do Supabase).
**Correção:** usuário recopiou a chave certa (rótulo "service_role", não "anon") do Supabase → Project Settings → API, colou de novo na env var, redeploy.

### Metodologia que funcionou bem pra esse tipo de debug
Verificação direta e independente do relato do usuário, em vez de só confiar em "não funcionou":
- `curl` direto no endpoint publicado pra confirmar comportamento real (405/400/500) sem depender de cache do navegador do usuário.
- Download do bundle JS publicado (`curl` + `grep`) pra confirmar que o código de fato mudou no ar, antes de suspeitar de outras causas.
- Pedir o JSON bruto do evento no Stripe (Workbench → Events → `checkout.session.completed` → Event data) em vez de confiar só no status "Succeeded/Failed" — foi ali que apareceu `client_reference_id: null`, a pista decisiva do bug 1.
- Pedir o log completo do Vercel (`console.error` com o objeto de erro do Postgres, incluindo `code`) em vez de só o texto genérico da resposta do webhook — os códigos `42703` e `42501` identificaram os bugs 2 e 3 na hora, sem chute.

### Pendente
- Preço divergente num produto de teste (mostra "£7" no catálogo do site, mas o Payment Link do Stripe cobra "£1") — resíduo de teste, ajustar quando for organizar o catálogo de verdade, não é bug.
- Migrar pra chaves **live** do Stripe (hoje só testado em sandbox/test mode) quando for pra produção de verdade — precisa de um webhook novo em modo live (ambiente separado do sandbox).

**✅ Confirmado com conta nova (registro do zero → confirmação de email → primeira compra) — funcionou perfeitamente.**

---

## Sessão 04/07/2026 (cont.) — UX: retomar compra após cadastro/login + onboarding único + log de buscas

### Problema identificado depois do teste com conta nova
Fluxo original: visitante clica "Comprar" → manda pro cadastro → confirma email → precisa navegar de novo até o produto e clicar em "Comprar" outra vez. Fricção desnecessária, e still show "Your dashboard is empty" logo após confirmar (assustador pra quem só quer pagar).

### 1. Retomada automática da compra
- `ProductDetail.jsx` (`handleBuy`): quando não logado, guarda `product.id` em `localStorage` (`uffi_pending_buy`) antes de navegar.
- `UserDashboard.jsx`: no mount, checa esse `localStorage`; se existir, redireciona direto pra `/products/{id}?autobuy=1` (mesmo padrão já usado pro `?tab=settings`).
- `ProductDetail.jsx`: novo efeito que detecta `?autobuy=1` e dispara `handleBuy()` sozinho assim que `user`+`product` estão prontos, depois limpa o parâmetro da URL.
- Funciona tanto pra quem cadastra quanto pra quem já tinha conta e só precisou logar (a intenção fica no localStorage independente do caminho de auth).

### 2. Onboarding único ("smart signup/login")
Motivação do usuário: evitar a pessoa cair "sem querer" numa tela de login sem nunca ter se cadastrado, e simplificar o caminho mais curto possível até pagar.
- `api/check-email.js` (novo) — serverless function que recebe um email e devolve só `{ exists: boolean }` (usa a service role key; valida formato do email antes de consultar; não expõe nenhum dado além do booleano — mitiga parcialmente risco de enumeração de emails, sem rate-limiting dedicado por ora).
- `src/pages/BuyAuthPage.jsx` (novo, rota `/start`) — tela única com indicador de passos (email → senha/confirmação → pagamento). Primeiro só pede email; consulta `/api/check-email`; mostra dinamicamente login (se já existe conta) ou cadastro completo (se é novo). Ao carregar, se vier `?lang=xx`, muda o idioma da UI automaticamente pra esse.
- `ProductDetail.jsx`: `handleBuy` agora manda pra `/start?lang={product.language}` em vez de `/register` — a tela de onboarding já abre no idioma do produto que a pessoa quis comprar, não no idioma "padrão" do site.
- Traduções novas (`onboard.*`) adicionadas nos 4 idiomas (en/pt/es/it) em `src/lib/translations.js`.
- `/login` e `/register` continuam existindo do jeito que estavam, pra quem entra por esses links diretos (ex: header) — o `/start` é só o ponto de entrada específico do fluxo de compra.

### 3. Log anônimo de buscas sem resultado
Motivação do usuário: descobrir que produtos as pessoas procuram e ainda não existem no catálogo, sem fricção nem coleta de dado pessoal (decisão explícita do usuário: só o termo, anônimo — sem capturar email).
- `sql/2026-07-04_search_logs.sql` (novo) — tabela `search_logs` (`query`, `language`, `created_at`, sem `user_id`/email de propósito). RLS: qualquer um pode inserir (`WITH CHECK (true)`); só admin pode ler (reaproveita `is_admin_or_super()` já existente).
- `catalogQueries.js`: nova função `logSearch(query, language)` — fire-and-forget, engole erro silenciosamente (não é crítico).
- `HomePage.jsx`: efeito com debounce de 800ms sobre a busca já existente — só loga quando a busca **não encontra nenhum produto** e tem 2+ caracteres. Nenhuma mudança visual, é 100% silencioso.

### ⏳ Pendente
- Não existe (ainda) uma tela de admin pra visualizar os termos buscados sem resultado — os dados ficam só na tabela por enquanto; vale construir uma visualização no Admin numa sessão futura, se fizer sentido.
- Lint automatizado (`eslint`) seguiu travando neste ambiente (mesmo problema de kernel já documentado) — verificação feita via parser do Babel direto (checagem de sintaxe, não de regras de lint) em todos os arquivos tocados; todos passaram limpos.

**✅ Migration `search_logs` rodada no Supabase, testado.**

---

## Sessão 04-05/07/2026 (cont.) — Separação Production/Staging + Stripe modo Live validado

**Motivação:** até aqui, todo push pra `main` ia direto pro site ao vivo (`www.uffisolutions.com`) — sem espaço pra testar mudanças com segurança antes de publicar de verdade. Pedido do usuário: um ambiente de teste/manutenção separado, e depois "promover" pro live só quando aprovado.

### Arquitetura escolhida: branches + ambientes nativos da Vercel (não dois projetos)
Já tínhamos aprendido da forma difícil (sessão anterior, dois projetos Vercel duplicados) que **não vale duplicar projeto** pra isso. A solução correta, um projeto só (`uffisolutions-c549`):

- **Branch `main`** → ambiente **Production** da Vercel → domínio `www.uffisolutions.com` → chaves **live** do Stripe.
- **Branch `staging`** (nova, criada nesta sessão) → cai automaticamente em **Preview** (Vercel: "Preview = todas as branches não atribuídas", não precisou configurar nada extra) → URL própria: `https://uffisolutions-c549-git-staging-hubukbox-s-projects.vercel.app` → chaves de **teste/sandbox** do Stripe.
- **Fluxo de trabalho**: mudanças entram primeiro na `staging` → testa na URL de preview → aprovado → `merge` `staging` → `main` → vai pro ar de verdade.

### Variáveis de ambiente separadas por ambiente
Na Vercel, `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` viraram **duas entradas cada**, mesmo nome, escopos diferentes:
- Uma marcada só **"Production"**, com os valores **live** (`sk_live_...`, `whsec_...` do webhook live).
- Uma marcada só **"Preview"**, com os valores **test/sandbox** (`sk_test_...`, `whsec_...` do webhook de teste).

`SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` continuam **compartilhadas** entre os dois ambientes — é o mesmo banco de dados Supabase nos dois casos (não existe "Supabase de teste" separado, só o Stripe tem ambientes distintos). **Nota de atenção**: como o banco é compartilhado, compras de teste feitas na `staging` gravam no banco de dados real (só não geram cobrança real, já que usam o Stripe sandbox) — aceito como trade-off, não configurado banco isolado pra staging por ora.

**Erro cometido e corrigido durante a configuração**: colou-se por engano a `Publishable key` (`pk_live_...`) no lugar da `Secret key` (`sk_live_...`) na entrada "Production" do `STRIPE_SECRET_KEY` — são duas chaves diferentes mostradas lado a lado no Stripe, fácil de confundir. Corrigido buscando a chave certa ("Secret key", não "Publishable key") no Stripe em modo Live.

### Deployment Protection da Preview e o Protection Bypass
A URL de Preview vem, por padrão, protegida por **Vercel Authentication** (só quem está logado no time consegue visualizar) — bom pra visitantes aleatórios, mas isso **bloqueia o webhook do Stripe** (chamada servidor-a-servidor, sem login). Resolvido com a opção gratuita da Vercel (**não** a "Password Protection", que é paga — $150/mês no plano Pro):
- Vercel → Project Settings → Deployment Protection → **"Protection Bypass for Automation"** → gerado um secret.
- O webhook de **teste** no Stripe (destino "empowering-rhythm") foi reapontado da URL antiga (`www.uffisolutions.com`) pra URL de preview, com o secret anexado: `{preview-url}/api/stripe-webhook?x-vercel-protection-bypass={secret}`.

### Webhook em modo Live criado
Webhooks Live e Test são objetos completamente separados no Stripe (não compartilham nada, cada um com seu próprio signing secret). Criado um destino novo em modo **Live**, apontando pra `www.uffisolutions.com/api/stripe-webhook` (sem parâmetro de bypass — produção não tem Deployment Protection ativada), evento `checkout.session.completed`. O signing secret gerado foi colado na entrada "Production" do `STRIPE_WEBHOOK_SECRET`, e um redeploy manual disparado pra produção pegar o valor novo (salvar env var na Vercel não redeploya sozinho).

### ✅ Testado e confirmado nos dois ambientes
- **Staging/Preview**: compra de teste completa (cartão `4242...`, através da URL de preview com o bypass token) → acesso liberado em `user_product_access`.
- **Production/Live**: produto novo criado no Stripe em modo Live (Payment Link real) → colado no Admin do site → **compra real, com cartão real** → acesso liberado automaticamente, confirmado no Supabase.

### Memória salva (fora do código)
Adicionada uma memória de referência (`staging_preview_environment`) com a URL de preview, o mecanismo do Protection Bypass, e a lógica de separação de env vars — pra não precisar redescobrir isso numa sessão futura.

### ⏳ Pendente (na época — ver sessão seguinte pra atualização)
- Preço divergente do produto de teste sandbox (£7 no catálogo vs £1 no Payment Link) — ajustar quando organizar o catálogo de verdade.
- ~~Reembolso/estorno do Stripe ainda não revoga acesso automaticamente~~ **Resolvido — ver sessão seguinte.**
- Considerar (sem pressa) apagar de vez o projeto Vercel `uffisolutions` antigo (hoje só desconectado do Git) — só depois de confirmar que nada externo depende do domínio `uffisolutions.vercel.app`.

---

## Sessão 05/07/2026 — Auditoria completa da plataforma + correções/melhorias

**Motivação:** usuário pediu uma auditoria completa (histórico de pendências, estado do painel admin, código órfão, segurança, i18n) e depois pediu pra implementar tudo que foi encontrado — os bugs reais e as 9 sugestões de melhoria.

### Achado principal da auditoria: bug real nas categorias
`createCategory`/`updateCategory` (`catalogQueries.js`) só gravavam nas colunas simples de `categories`. Toda exibição pública (`fetchAllCategories`) lê de `category_translations`, nunca escrita por esse formulário — **qualquer categoria criada/editada pelo Admin aparecia como "Other" ou com nome desatualizado no site**, um resíduo silencioso da migration `2026-07-01_category_names_i18n.sql` (que já avisava, no próprio comentário, que a exibição pública não seria afetada por ela).

### O que foi corrigido/implementado

**1. Bug de categorias** — `createCategory`/`updateCategory` continuam gravando as colunas simples (usadas só pelo form do admin), mas agora `AdminCategories.jsx` também chama uma função nova, `upsertCategoryTranslations()`, que grava as 4 traduções (en/pt/it/es) na tabela `category_translations` de verdade a cada save. `fetchAllCategories` também foi corrigida pra montar o preview do form (EN/PT/IT/ES) a partir dos dados reais da tabela de traduções, não mais das colunas simples desatualizadas.

**2. Painel admin em inglês profissional** — escopo real era menor que parecia: só `AdminCategories.jsx` (100% português) precisou de tradução completa (títulos, toasts, confirm dialogs, placeholders), e duas opções de classificação em `UserProfileModal.jsx` ("Em risco"/"Inativo" → "At risk"/"Inactive"). As outras 4 páginas do admin já estavam em inglês.

**3. Reembolso do Stripe revoga acesso** — `api/stripe-webhook.js` agora escuta `charge.refunded`. Como o Charge não carrega `client_reference_id` (só existe na Checkout Session), busca a sessão original via `stripe.checkout.sessions.list({ payment_intent })`, extrai `userId`/`productId` do `client_reference_id`, e remove a linha de `user_product_access` — funciona até pra compras já feitas antes dessa mudança, sem precisar de migration nova.

**4. Notificações conectadas (+ 1 gatilho real)** — toda a UI (`NotificationBell`/`NotificationDropdown`/`NotificationItem`) já existia, mas nada estava ligado e a tabela nem existia no banco:
- Nova migration `sql/2026-07-05_notifications.sql`.
- `AuthProvider` (contexto separado, próprio, que já existia mas nunca foi montado) e `NotificationProvider` agora envolvem o app inteiro em `main.jsx`.
- Rota `/notifications` adicionada; sino montado no `Header.jsx` (desktop + mobile) e na topbar do `UserDashboard.jsx`.
- **Bugs extras encontrados e corrigidos nesse caminho**: `NotificationsPage.jsx`, `NotificationItem.jsx` e `NotificationDropdown.jsx` importavam `useI18n` de um `I18nContext` que **não tem nenhum provider montado em lugar nenhum do app** — teria derrubado a página assim que alguém clicasse no sino ou acessasse `/notifications`. Trocado pelo `useLanguage`/`t()` de verdade, com chaves novas adicionadas nos 4 idiomas em `translations.js`. `NotificationsPage.jsx` também importava `Logo` de um caminho que não existe no padrão do projeto (`@/components/Logo` em vez de `@/components/uffi/Logo`) — corrigido também.
- Gatilho real: `api/stripe-webhook.js` cria uma notificação ("Purchase confirmed") pro usuário assim que o acesso é liberado com sucesso.

**5. Perfil — idioma e senha editáveis** — `ProfileModal.jsx` (self-service) ganhou um seletor de idioma (grava em `language`+`preferred_language`, mesma lógica que só existia no modal de boas-vindas do primeiro login) e uma seção de trocar senha (reaproveita `updatePassword` já existente). Foto/avatar ficou de fora por decisão do usuário — exigiria infraestrutura de storage nova.

**6. "Visto" nos entregáveis da biblioteca** — nova tabela `deliverable_views` (`sql/2026-07-05_deliverable_views.sql`), novo helper em `deliverableQueries.js`, e `DeliverableItem` (`AccessModal.jsx`) ganhou um badge de "visto" + marca ao clicar, sem duplicar lógica entre os vários tipos de mídia (refatorado pra envolver o conteúdo existente com um wrapper único, em vez de mexer em cada branch de YouTube/Vimeo/PDF/etc. separadamente).

**7. Rate limiting em `/api/check-email`** — sem KV/Redis no projeto, implementado via tabela nova `sql/2026-07-05_rate_limits.sql` (por IP, janela de 5 min, limite de 10 tentativas).

**8. Paginação no Admin** — client-side (sem mudar as funções de busca compartilhadas) em `AdminProducts.jsx` e `AdminUsers.jsx`, 20 itens por página. `AdminCategories.jsx` não precisou (dataset pequeno por natureza).

### O que NÃO foi feito nesta rodada (por decisão do usuário)
- Checagem manual de RLS no Supabase — usuário vai conferir sozinho.
- Limpeza dos ~50 arquivos órfãos — deixados como estão, sem risco pro que já funciona.
- Foto/avatar de perfil — precisa de infraestrutura de storage nova, fica pra depois.

### Verificação
- `eslint` seguiu travando neste ambiente (mesmo problema de kernel já documentado várias vezes) — todos os arquivos tocados (22 no total) verificados via parser do Babel (checagem de sintaxe) e passaram limpos.
- Publicado na branch `staging` (commit `dc6d306`) pra teste manual antes de ir pra `main`/produção.

**✅ As 3 migrations rodadas no Supabase pelo usuário.**

### Correção extra — `rate_limits` sem RLS (achado pelo usuário)
O comentário original do `sql/2026-07-05_rate_limits.sql` dizia "RLS stays off — no anon-key access path", o que estava **errado**: o Supabase expõe toda tabela do schema `public` pela API REST por padrão, então sem RLS qualquer um com a chave `anon` (pública, vai no bundle do site) conseguiria ler ou resetar os contadores de rate limit direto, driblando a proteção. Corrigido: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` sem nenhuma policy (nega tudo pra `anon`/`authenticated`; a service role usada pelo `/api/check-email` sempre ignora RLS, então nada muda no funcionamento real).

### Bug extra encontrado ao testar — "Inactive" era só cosmético
Usuário testou um produto marcado inativo no Admin e reparou que ele **continuava aparecendo pro público** — nenhum lugar do código de fato filtrava por `active`. Corrigido:
- `HomePage.jsx`/`ProductsPage.jsx`: produtos inativos somem da vitrine/catálogo.
- `ProductDetail.jsx`: mostra "produto indisponível" em vez da tela de compra — **mas só pra quem não tem acesso ainda**. Quem já comprou continua vendo normal e acessando a Biblioteca, mesmo que o produto vire inativo depois (inativar nunca revoga acesso de quem já tem).
- Traduções novas (`detail.unavailable`/`detail.unavailable_desc`) nos 4 idiomas.

### Sugestão implementada — contador de "donos" por produto no Admin
Motivação do usuário: vão cadastrar vários produtos gratuitos, e querem ver quanto de interesse/aquisição cada produto teve (pago ou grátis, mesma tabela `user_product_access`). Nova função `getProductAccessCounts()` em `accessQueries.js`, nova coluna "Owners" em `AdminProducts.jsx` (mostra `ativos / total`, ou "—" se ninguém tiver).

### ⏳ Pendente
- Testar manualmente na URL de preview da `staging`: criar categoria nova e confirmar nome certo no site; trocar idioma/senha no perfil; ver notificação aparecer após compra de teste; testar paginação; testar reembolso de uma compra sandbox; confirmar que produto inativo some da vitrine mas continua na Biblioteca de quem já comprou.
- Depois de validado, fundir `staging` → `main`.

---

## Sessão 05/07/2026 (cont.) — Sistema de suporte/feedback (tickets)

**Motivação:** usuário pediu um jeito simples de registrar chamados de suporte/feedback dos clientes, centralizado, com o admin conseguindo visualizar agrupado por status — mas **sem virar um chat ao vivo**: a conversa de verdade sempre continua por email, o sistema só existe pra dar um ID de referência e manter um registro central.

**Decisões confirmadas com o usuário antes de implementar:**
- Email via `mailto:` (abre o cliente de email do próprio usuário, já preenchido) — sem integrar serviço de envio novo (Resend etc.), mesmo padrão já usado no "Give feedback" da Biblioteca.
- Agrupamento no Admin por status (Aberto / Resolvido).

### O que foi implementado
- **Migration** `sql/2026-07-05_support_tickets.sql` — tabela `support_tickets` (`type`: support/feedback, `status`: open/resolved, `resolved_at`/`resolved_by`), RLS: usuário cria/lê só os próprios; admin lê/atualiza todos (reaproveita `is_admin_or_super()`).
- **`src/lib/supportQueries.js`** (novo) — CRUD completo (`createTicket`, `getMyTickets`, `getAllTickets` com join manual pro nome/email do usuário, `resolveTicket`, `reopenTicket`).
- **`SupportModal.jsx`** (novo, self-service) — escolhe tipo (Support/Feedback), assunto, mensagem. Ao enviar: grava o ticket, gera uma referência curta (8 primeiros caracteres do UUID), e abre o `mailto:` com assunto `[Ticket #REF] ...` já preenchido.
- **Ponto de entrada**: ícone de suporte no `Header.jsx` (desktop + mobile) e na topbar do `UserDashboard.jsx`, ao lado do sino de notificações.
- **`AdminSupport.jsx`** (novo, rota `/admin/support`, item novo no menu "Users & Access" do `AdminLayout.jsx`) — lista os tickets agrupados em Aberto/Resolvido, com botão "Reply" (mailto pré-preenchido com a referência) e Marcar Resolvido/Reabrir.
- Nova permissão `support: ['read', 'update']` pra super_admin/admin/moderator em `rolePermissions.js`.

### ⏳ Pendente
- Testar na `staging`: abrir um chamado como usuário comum, confirmar que o cliente de email abre com o assunto certo, e que aparece no Admin → Support.
- ~~Rodar a migration `sql/2026-07-05_support_tickets.sql` no Supabase.~~ **Rodada em 06/07/2026 — ver sessão seguinte.**

---

## Sessão 06/07/2026 — Auditoria completa (lint + build + revisão de código) + limpeza final

**Motivação:** usuário pediu uma inspeção completa do estado atual do repo (grande volume de mudanças não commitadas: onboarding de compra, notificações, suporte, Stripe refund, i18n do admin, paginação) antes de seguir, com checklist do que estava OK e do que faltava.

### Bug corrigido antes da auditoria — `generate-llms.js` quebrando o build da Vercel
O log de build mostrava `❌ Error processing /vercel/path0/src/pages/admin: EISDIR: illegal operation on a directory, read`. Causa: `findReactFiles()` (`tools/generate-llms.js`) fazia um `readdirSync` raso e tentava ler `src/pages/admin` (uma pasta) como se fosse um arquivo de página — o erro era engolido por um try/catch e não derrubava o build, mas também significava que **as páginas do admin nunca eram varridas** pro `llms.txt`. Corrigido pra percorrer subpastas recursivamente e só pegar `.js/.jsx/.ts/.tsx`.

### 3 erros reais achados pelo `eslint` (rodava travado nesta máquina — contornado rodando com stdin redirecionado de `/dev/null`, mesma classe do travamento de kernel já documentado)
- **`AdminProducts.jsx`** e **`AdminUsers.jsx`** — `useEffect` de reset de paginação declarado *depois* de um `return` condicional (`if (!permissions.canRead) return ...`) → violação real das Rules of Hooks (nº de hooks muda entre renders se a permissão mudar). Movidos pra antes do return, nos dois arquivos.
- **`AdminSupport.jsx`** — import de `MessageSquareText`, ícone que não existe na versão instalada do `lucide-react` (erro de import). Trocado por `MessageSquare`.
- `npm run lint` limpo depois, 0 erros.

### Build local — não verificado até o fim (limitação conhecida da máquina)
`npm run build` (e até um `git clone` de teste, tentando reproduzir num diretório limpo) travaram sem progresso real de CPU — mesma classe de travamento de kernel/iCloud já documentada na sessão de 03/07 (aquele caso era `git`, agora foi `esbuild`/`vite build`). Não é um problema do código. Build da Vercel (screenshot do usuário) já funciona normalmente e deve ficar 100% limpo com o fix do `generate-llms.js` acima.

### Revisão manual de tudo que estava não commitado — sem problemas encontrados
Confirmado, arquivo por arquivo: fluxo de retomada de compra (`ProductDetail.jsx`/`UserDashboard.jsx`/`BuyAuthPage.jsx`), "visto" nos entregáveis (`deliverableQueries.js`/`LibraryPage.jsx`/`AccessModal.jsx`), troca de senha/idioma no perfil, sino de notificações + modal de suporte no Header/Dashboard, tradução de categorias (`upsertCategoryTranslations`), `api/check-email.js` e `api/stripe-webhook.js` (boas práticas: verificação de assinatura, service role só no servidor, rate limit, RLS), e as 6 migrations SQL novas (todas com RLS coerente).

### Checklist de pendências — a maioria já tinha sido resolvida em sessões anteriores
Ao cruzar com o histórico deste arquivo, só restava genuinamente pendente:
- Rodar `sql/2026-07-05_support_tickets.sql` no Supabase — **feito nesta sessão** (`Success. No rows returned`, confirmado pelo usuário).
- Decisão sobre 2 arquivos soltos na raiz, já sinalizados desde 02/07: `EMAIL_TEMPLATES.html` (mantido — é referência ativa) e o zip `"uffisolutions-v1.0-28jun2026 codigo Horizons"` (473KB, não rastreado pelo git, não referenciado por nenhum import) — **removido nesta sessão**, confirmado sem nenhuma referência no código antes de apagar.

### ⏳ Pendente
- Testar ponta a ponta o sistema de suporte agora que a tabela existe: abrir chamado como usuário comum → conferir email `mailto:` com assunto certo → conferir listagem em Admin → Support.
- Mesmos testes manuais já listados na sessão de 05/07 (categorias, paginação, reembolso, produto inativo) antes de fundir `staging` → `main`.

---

## Sessão 06/07/2026 (cont.) — Suporte: visibilidade de tickets + merge pra produção

**Motivação:** usuário testou o fluxo de suporte na prática (abriu um chamado como usuário comum) e notou dois problemas de UX: nada sinalizava a existência do ticket no painel Admin (o menu "Support" era um item comum, sem destaque), e o próprio usuário não tinha como conferir o status do que já tinha enviado depois da confirmação inicial.

### O que foi implementado
- **`supportQueries.js`** — nova `getOpenTicketCount()` (query só de contagem, sem trazer linhas).
- **`AdminLayout.jsx`** — badge vermelho com o nº de tickets abertos no item "Support" do menu lateral, e um atalho extra (ícone de bóia + mesmo badge) na topbar, visível sempre que houver ao menos 1 ticket aberto.
- **`SupportModal.jsx`** — ao abrir, busca os tickets do próprio usuário (`getMyTickets`) e mostra a lista (assunto, status Open/Resolved, data) antes do formulário. Botão "Open New Ticket" revela o formulário de um novo chamado; quem já tem tickets vê a lista primeiro, não o formulário em branco.

### Publicado
- `staging` (`495504c`) → testado e aprovado pelo usuário → **fundido em `main` via fast-forward, publicado em produção** (`www.uffisolutions.com`).
- Esse mesmo merge levou junto todas as correções da sessão anterior (generate-llms EISDIR, hooks-order em AdminProducts/AdminUsers, ícone quebrado em AdminSupport, botão de suporte no mobile do Header) — que até então só existiam em `staging`.

### ⏳ Pendente
- Confirmar visualmente na produção (pós-build da Vercel) que o badge aparece corretamente e que a lista de tickets do usuário carrega.

---

## Sessão 07/07/2026 — Categorias múltiplas por produto + filtro na Home

**Motivação:** usuário perguntou se um produto poderia pertencer a mais de uma categoria (ex: "Personal Shopper" em Negócio Online + Serviços + Renda Extra) e pediu um filtro de categoria + busca na Home.

### O que foi implementado
- **Migration** `sql/2026-07-07_product_categories.sql` — tabela `product_categories` (N:N), RLS: leitura pública, escrita só admin (`is_admin_or_super()`). `products.category_id` continua existindo como categoria "primária" (compatibilidade com telas que só leem uma categoria); migration já faz o backfill.
- **`catalogQueries.js`** — `getCategoryIdsForProduct(s)`, `setProductCategories()`.
- **`AdminProducts.jsx`** — seletor de categoria virou chips de múltipla escolha (até 3, a primeira marcada vira a "primária").
- **`HomePage.jsx`** — campo de busca visível + dropdown de categoria acima da grade de produtos, só na Home (por escopo, não em `/products`). Nomes de categoria trocam de idioma instantaneamente (categorias já carregam as 4 traduções de uma vez, sem refetch).

### 🔴 Incidente em produção — causado por esta migration
A migration criou um **segundo caminho de relacionamento** entre `products` e `categories` (o FK direto `products.category_id` já existente + o novo N:N via `product_categories`). O PostgREST (camada de API do Supabase) passou a rejeitar qualquer query que fizesse `categories(id, slug, color, icon)` embutido dentro de `products` com erro `PGRST201` ("more than one relationship was found") — **isso derrubou a listagem de produtos (Home, Products, ProductDetail) tanto em staging quanto em produção**, já que a migration foi rodada no banco compartilhado entre os dois ambientes.

Descoberto porque o usuário testou a Home em staging e viu "No products found for these filters" mesmo com todos os filtros neutros. Confirmado via `curl` direto na API REST do Supabase (mesma anon key usada em produção) que a query dava erro.

**Corrigido**: as 3 queries afetadas (`fetchAllProducts`, `fetchAllProductsAllLanguages`, `fetchProductsByCategory`) agora desambiguam explicitamente qual relacionamento embutir: `categories!products_category_id_fkey(id, slug, color, icon)` em vez de `categories(id, slug, color, icon)`. Testado via `curl` antes de publicar. **Publicado direto em `main`/produção com urgência** (commit `3df529d`), depois sincronizado em `staging` via merge (`1f3c596`).

**Lição para o futuro**: qualquer migration que crie uma nova relação entre duas tabelas que já se relacionam de outro jeito precisa checar se algum `select(...)` existente embute a tabela de destino sem desambiguar o FK — o Supabase/PostgREST não escolhe sozinho quando há mais de um caminho possível.

### ✅ Testado na staging e publicado em produção
Migration rodada, categorias múltiplas testadas no Admin, filtro/busca validados na Home. `staging` → `main` fundido via fast-forward (commit `e8a6b0f`).

---

## Sessão 07/07/2026 (cont.) — Home: hero simplificado + marquee de produtos

**Motivação:** usuário achou os botões "Explore Products"/"Acessar Plataforma" do hero desnecessários e sugeriu uma faixa automática mostrando os produtos, mais discreta.

### O que foi implementado
- **`Header.jsx`** — link "Products" agora aparece no cabeçalho **desktop** também pra visitante (já existia só no menu mobile) — precisa disso já que o hero não vai mais ter botão apontando pro catálogo.
- **`HomePage.jsx`** — removidos os botões do hero. No lugar, uma faixa contínua (marquee) com cards pequenos dos produtos, ordem embaralhada a cada carregamento, com a flag do idioma ao lado da miniatura (não em cima dela — primeira tentativa colocou a flag posicionada `absolute` sobre a miniatura, mas ficou cortada pelo `overflow-hidden` do container da imagem; corrigido movendo pra um elemento próprio ao lado).
- Decisão consciente de **não** usar carrossel tradicional (um produto por vez, com setas) — esse padrão tem taxa de clique historicamente baixa; o marquee contínuo é só um teaser visual passivo, não compete com o filtro/busca abaixo dele.

### Publicado
`staging` (`e8a6b0f`) → aprovado pelo usuário → fundido em `main` via fast-forward, publicado em produção.
