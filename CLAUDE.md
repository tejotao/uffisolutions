# UffiSolutions — Projeto B do ecossistema

Central de vendas e gestão de acessos (uffisolutions.com). Regras do ecossistema e isolamento entre os projetos: `../CLAUDE.md`. Histórico detalhado das sessões: `CONTEXT.md`.

## Papel e limites

- **É este projeto que vende e libera acesso.** O Stripe processa o pagamento; o webhook (`api/stripe-webhook.js`) grava a liberação em `user_product_access` com `expiry_date` = hoje + `access_duration_days` do produto (vazio = vitalício). Reembolso (`charge.refunded`) revoga o acesso.
- **HUB Simulator (Projeto A, pasta `UffiSphere/`)**: B vai vender o plano PRO (A já aponta para `uffisolutions.com/checkout/hub-simulator-pro`) e emitir o token de acesso com plano + validade; A só valida o token. A ligação entre os dois é **só o token**: A não lê o banco de B, não recebe chaves de B e não importa código de B. **Ainda não implementado aqui**: não existe essa rota, o produto nem a emissão de token (a especificação do lado de A está em `UffiSphere/docs/superpowers/specs/2026-10-11-pro-access-token.md`).
- **HubUKBox (Projeto C)**: sem nenhuma ligação. Não reaproveitar usuários, tabelas, chaves, contas Stripe/Resend nem código dele.

## Rodar localmente

- `npm run dev` → **http://localhost:3001** (porta fixa do Projeto B; `--strictPort` falha em vez de pular de porta). A 3000 é do HUB Simulator e a 3003 do HubUKBox.
- As funções de `api/` são da Vercel e **não rodam** no `vite` local.
- Para o login funcionar no local, o Supabase precisa ter `http://localhost:3001/**` em Authentication → URL Configuration → Redirect URLs.

## Integrações deste projeto

| Serviço | O que usa | Onde |
|---|---|---|
| **GitHub** | `tejotao/uffisolutions` (público). Push só com a conta `tejotao` por enquanto (ver `../CLAUDE.md`). Action `supabase-heartbeat.yml` pinga o Supabase a cada 3 dias para não pausar o plano grátis. | `.github/workflows/` |
| **Vercel** | Projeto `uffisolutions-c549`, time `hubukbox-s-projects`, deploy automático pelo app da Vercel no GitHub (branch `main` → produção). Domínio `www.uffisolutions.com` (o domínio raiz redireciona). ⚠️ Não é a conta em que a Vercel CLI deste Mac está logada (`hubukbox-8106`, que é do HubUKBox). | `vercel.json` |
| **Supabase** | Projeto `qrnqwewmomlxhaiujrnd` (auth, banco, RLS). Migrations em `sql/`. | `src/lib/`, `sql/` |
| **Stripe** | Conta UffiSolutions (⚠️ existe outra conta, do hubukbox, no mesmo login). Payment Links por produto (`stripe_payment_link`) + webhook `checkout.session.completed` e reembolso. PayPal ligado como método de pagamento dentro do Stripe. | `api/stripe-webhook.js` |
| **Resend** | E-mails de venda (para o dono e para o comprador), de `us@uffisolutions.com`. Domínio `uffisolutions.com` verificado (região UE). Chave `uffisolutions-webhook`. | `api/stripe-webhook.js` |
| **Hostinger** | DNS do domínio, caixa de e-mail `us@uffisolutions.com` e SMTP usado pelo Supabase Auth (confirmação de conta, reset de senha, convite). | `docs/EMAIL-SETUP.md` |
| **Conteúdo** | Entregáveis em Google Drive/Docs, YouTube e Vimeo (links nunca expostos ao usuário). | `src/` |

## Variáveis de ambiente

| Variável | Onde | Uso |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env.local`, Vercel, secrets do GitHub | Front + functions + heartbeat |
| `VITE_SUPABASE_ANON_KEY` | `.env.local`, Vercel, secrets do GitHub | Front + functions + heartbeat |
| `SUPABASE_SERVICE_ROLE_KEY` | só Vercel | Functions (liberar acesso, criar conta do comprador) |
| `STRIPE_SECRET_KEY` | só Vercel | Webhook |
| `STRIPE_WEBHOOK_SECRET` | só Vercel | Verificar assinatura do webhook |
| `RESEND_API_KEY` | só Vercel (Production + Preview) | E-mails de venda |
| `TEMPLATE_BANNER_SCRIPT_URL`, `TEMPLATE_REDIRECT_URL` | opcionais, build | Banner do template (`vite.config.js`) |

Chaves secretas nunca entram no repositório nem no front (só variáveis `VITE_*` chegam ao navegador).
