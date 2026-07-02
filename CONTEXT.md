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
- Deploy via Hostinger Horizons (Vite build → static hosting)

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
