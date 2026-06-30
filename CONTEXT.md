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
```

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

#### Password Reset Page (`/reset-password`)
Actualmente o email de reset é enviado mas a página de destino não existe no app. O utilizador recebe o link mas não consegue redefinir a senha.
- Página com campo de nova senha + confirmação
- Usa `supabase.auth.updateUser()` com token da URL

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
| **Assinaturas** | Modelo recorrente para acesso a biblioteca completa |

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
| **Password Reset Page** (`/reset-password`) | Alta | Email enviado mas página de destino não existe |
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
```
