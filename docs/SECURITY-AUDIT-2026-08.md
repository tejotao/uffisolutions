# Auditoria de segurança e correções — Agosto 2026

Registro do que foi encontrado e corrigido na sessão de 2026-08-08, cobrindo o
fluxo de cadastro/primeiro acesso e uma revisão de segurança do Supabase
(`qrnqwewmomlxhaiujrnd` / projeto "UffiSolutions", organização "UffiSphere").

## 1. Fluxo de cadastro / primeiro acesso — bugs corrigidos

Ponto de partida: um usuário que se cadastrava a partir de um produto grátis
em italiano via, no primeiro acesso ao dashboard, apenas os produtos grátis
em português.

| Commit | O que corrigia |
|---|---|
| `ddd5db6` | Captura o idioma do produto de origem e usa no primeiro carregamento do dashboard |
| `6537a4e` | A home tinha um atalho que pulava a página do produto e ia direto pra `/login` — a captura de idioma nunca rodava nesse caminho |
| `1f23270` | Descoberta real: `profiles.language` e `profiles.first_login` **não existem** no banco (só `preferred_language` existe) — o modal de boas-vindas nunca abria e, se abrisse, o save falharia. Reescrito para usar só o campo real; todo clique em produto grátis agora passa pela página do produto (fonte única) |
| `a574500` | Toast de "e-mail já cadastrado" só oferecia reenviar confirmação — sem saída pra quem já tinha conta confirmada. Agora oferece "Fazer login" como ação principal |
| `de5d1ce` | Dashboard mandava pra `/library/:id` sem nunca liberar acesso ao item grátis — corrigido pra liberar no clique; tela de "sem acesso" (fallback raro) ficou mais acolhedora |
| `195dddb`, `a45e378` | Logo quebrada (CDN Hostinger fora do ar) nos templates de e-mail e no preview Open Graph/Twitter do site |

Estado atual: fluxo de cadastro → confirmação de e-mail → primeiro acesso →
produtos grátis no idioma certo, testado e confirmado pelo usuário.

## 2. Templates de e-mail (Supabase Auth)

- `docs/email-templates/email-confirmation.html` e `password-reset.html`
  atualizados com a logo hospedada no bucket `logo` do Supabase Storage
  (`https://qrnqwewmomlxhaiujrnd.supabase.co/storage/v1/object/public/logo/Logo%20UffiSpher1.png`).
- **Colados manualmente no painel do Supabase** (Authentication → Email
  Templates → Confirm signup / Reset password) em 2026-08-08 — confirmado
  pelo usuário. Lembrete: esses arquivos no repo são só a referência
  versionada; o Supabase não lê o repo, então qualquer edição futura precisa
  ser colada manualmente de novo.

## 3. Auditoria de segurança do Supabase

Executada via Claude in Chrome (acesso direto ao painel), em duas rodadas.

### 3.1 Storage

- **RLS em `storage.objects`**: ativado (confirmado por consulta direta ao
  catálogo do Postgres — a Table Editor não expõe o toggle pra esse schema
  por ser protegido).
- **Bucket `logo`**: público, leitura da imagem confirmada funcionando.
- **Achado crítico, corrigido**: existia uma policy `Insercao Publica
  Imagens` — `INSERT`, papel `public` (sem autenticação), `with_check =
  true`, **sem filtro de `bucket_id`**. Isso permitia upload anônimo em
  **qualquer** bucket do projeto (não só `logo`). Confirmado por leitura do
  código-fonte que o app nunca faz upload via Supabase Storage (só lê
  imagens públicas e usa links do Google Drive pros conteúdos pagos) — a
  policy não tinha uso legítimo. **Removida** em 2026-08-08:
  ```sql
  DROP POLICY "Insercao Publica Imagens" ON storage.objects;
  ```
  Confirmado depois que a leitura pública do bucket `logo` continuou
  funcionando normalmente (não dependia dessa policy).
- **9 buckets, todos públicos**: `logo`, `Viajante Autonomo`, `hchv pt-br`,
  `harmonize es`, `harmonize`, `PSinternacional`, `course-images`,
  `avatars`, `products`. Fazem sentido como públicos dado o uso (imagens de
  produto/curso exibidas sem login). **Pendente de confirmação manual do
  usuário**: conferir que o bucket `avatars` não tem nenhum arquivo sensível
  misturado com fotos de perfil.

### 3.2 Tabelas `public.*`

Todas com RLS ativado e policies definidas (confirmado via Database →
Policies). `public.rate_limits` tem RLS ativado sem nenhuma policy — **isso
é intencional**: confirmado no código (`api/check-email.js`) que só uma
rota serverless com a `SUPABASE_SERVICE_ROLE_KEY` mexe nessa tabela, então
ela não precisa ser acessível via API pública.

### 3.3 Funções `SECURITY DEFINER`

Supabase Security Advisor flagou 4 funções `SECURITY DEFINER` chamáveis por
usuários anônimos/autenticados. Código revisado linha a linha em
2026-08-08 — **nenhuma vulnerabilidade de escalonamento de privilégio
encontrada**:

- `handle_new_user` — grava só `full_name`/`client_code` no cadastro; nunca
  toca `role`/`is_admin`/`status`, mesmo que o metadata do signup tente
  incluir esses campos.
- `is_admin_or_super` — só leitura, verifica se o usuário é admin.
- `prevent_self_privilege_escalation` — bloqueia o próprio usuário de
  alterar `role`/`is_admin`/`status`/`classification`/`blocked_*` na
  própria linha.
- `prevent_self_role_escalation` — reforça o mesmo bloqueio de forma mais
  ampla (qualquer não-admin, chamando `is_admin_or_super()`).

As duas últimas são camadas redundantes intencionais — defesa em
profundidade, não falha. Único ponto cosmético: 3 das 4 funções não têm
`search_path` fixado (aviso do Advisor), mas como todas as referências a
tabelas são totalmente qualificadas (`public.profiles`), não há brecha real
de sequestro de schema. Sem urgência.

### 3.4 Itens conhecidos e não resolvidos (decisão do usuário)

- **Leaked Password Protection** (checagem de senha vazada via
  HaveIBeenPwned) — indisponível no plano Free do Supabase, exige upgrade
  para o plano Pro (custo). Não é bloqueante para o lançamento; decisão
  adiada pelo usuário.
- **Bucket `avatars`** — usuário ainda precisa confirmar manualmente que
  não há conteúdo sensível misturado.

## 4. Resumo do estado final

| Item | Status |
|---|---|
| Fluxo de cadastro/idioma/primeiro acesso | ✅ Corrigido e testado |
| Logo nos e-mails e no preview do site | ✅ Corrigida |
| Templates colados no Supabase | ✅ Confirmado pelo usuário |
| RLS em `storage.objects` | ✅ Ativado |
| Policy de upload público sem restrição | ✅ Removida |
| RLS nas tabelas `public.*` | ✅ Todas com RLS + policies |
| Funções `SECURITY DEFINER` | ✅ Revisadas, sem falha encontrada |
| `search_path` nas funções | 🟡 Cosmético, sem urgência |
| Leaked Password Protection | ⏸️ Adiado (requer plano Pro) |
| Conteúdo do bucket `avatars` | ⏸️ Aguardando confirmação manual do usuário |
