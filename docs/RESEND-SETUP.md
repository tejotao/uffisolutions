# Configuração de Email — Resend + us@uffisolutions.com + Supabase

Objetivo: todos os emails da plataforma (confirmação de conta, reset de password) 
enviados DE `us@uffisolutions.com` com branding UffiSolutions.

---

## PARTE 1 — Criar conta e verificar domínio no Resend

### 1.1 Criar conta
1. Acede a https://resend.com
2. Clica "Sign Up" → usa `tejotao@gmail.com`
3. Confirma o email

### 1.2 Adicionar e verificar o domínio `uffisolutions.com`
1. No dashboard Resend → **Domains** → **Add Domain**
2. Escreve `uffisolutions.com` → clica **Add**
3. O Resend vai mostrar registos DNS para adicionar:

```
Tipo    Nome               Valor
──────────────────────────────────────────────────────────
TXT     @  (ou vazio)      "v=spf1 include:_spf.resend.com -all"
TXT     resend._domainkey  [chave DKIM longa — copia do painel]
MX      (opcional)         feedback-smtp.us-east-1.amazonses.com
```

4. Vai ao painel DNS do `uffisolutions.com` (Hostinger, Cloudflare, etc.)
5. Adiciona os registos acima
6. Volta ao Resend → clica **Verify** (pode demorar até 24h, mas normalmente < 5 min)
7. Quando aparecer ✅ verde → domínio verificado

---

## PARTE 2 — Obter credenciais SMTP do Resend

1. No Resend → **API Keys** → **Create API Key**
   - Nome: `uffisolutions-supabase`
   - Permission: **Sending access**
   - Domain: `uffisolutions.com`
2. **Copia a chave** (só é mostrada uma vez!) — formato: `re_xxxxxxxxxxxxxxxx`

### Credenciais SMTP para o Supabase:
```
SMTP Host:     smtp.resend.com
SMTP Port:     465 (SSL) ou 587 (TLS)
SMTP User:     resend
SMTP Password: re_xxxxxxxxxxxxxxxx  ← a tua API Key
From Email:    us@uffisolutions.com
From Name:     UffiSolutions
```

---

## PARTE 3 — Configurar Supabase Auth com Resend

### 3.1 Activar SMTP personalizado
1. Supabase Dashboard → **Authentication** → **Settings**
2. Secção **SMTP Settings** → liga o toggle **Enable Custom SMTP**
3. Preenche com os dados acima

### 3.2 Verificar Redirect URLs
1. Supabase → **Authentication** → **URL Configuration**
2. **Site URL**: `https://uffisolutions.com`
3. **Redirect URLs** — adiciona:
   ```
   https://uffisolutions.com/reset-password
   https://uffisolutions.com/**
   http://localhost:3000/**    ← para desenvolvimento local
   http://localhost:5180/**
   ```

---

## PARTE 4 — Colar os templates de email no Supabase

Os templates HTML estão em `/docs/email-templates/`

### 4.1 Template de Confirmação de Email
1. Supabase → **Authentication** → **Email Templates**
2. Selecciona **Confirm signup**
3. **Subject:** `Confirm your UffiSolutions account ✉️`
4. **Body:** cola o conteúdo de `docs/email-templates/email-confirmation.html`
5. Clica **Save**

### 4.2 Template de Reset de Password
1. Selecciona **Reset password**
2. **Subject:** `Reset your UffiSolutions password 🔐`
3. **Body:** cola o conteúdo de `docs/email-templates/password-reset.html`
4. Clica **Save**

> ⚠️ A variável `{{ .ConfirmationURL }}` já está nos templates — o Supabase substitui automaticamente pelo link correcto.

---

## PARTE 5 — Testar

### Teste de Confirmação:
1. Vai a `https://uffisolutions.com/register` (ou localhost)
2. Regista um email de teste
3. Verifica a caixa de entrada — deve chegar DE `us@uffisolutions.com` com o template personalizado

### Teste de Reset:
1. Vai a `/login` → "Forgot password?"
2. Insere o email
3. Verifica a caixa de entrada — deve chegar o template de reset
4. Clica o link → deve redirecionar para `https://uffisolutions.com/reset-password`
5. Define a nova password → redireccionado para login automaticamente

---

## PARTE 6 — Verificar no Resend

Resend Dashboard → **Emails** → vês todos os emails enviados com:
- Status (Delivered / Bounced / Spam)
- Preview do email
- Destinatário e timestamp

---

## Checklist Final

- [ ] Conta Resend criada
- [ ] Domínio `uffisolutions.com` verificado (registos DNS adicionados)
- [ ] API Key gerada e guardada
- [ ] Supabase SMTP configurado com credenciais Resend
- [ ] Site URL e Redirect URLs configurados em Supabase
- [ ] Template "Confirm signup" colado e guardado
- [ ] Template "Reset password" colado e guardado
- [ ] Teste de registo enviado e recebido com branding correcto
- [ ] Teste de reset de password funcional end-to-end

---

## Troubleshooting

| Problema | Solução |
|---|---|
| Email não chega | Verifica SMTP no Supabase está enabled; verifica API key no Resend |
| Email vai para spam | Aguarda propagação DNS completa (24h); adiciona registo DMARC |
| Erro "Invalid from address" | Verifica que `uffisolutions.com` está verificado no Resend |
| Link de reset não funciona | Verifica que `https://uffisolutions.com/reset-password` está na lista de Redirect URLs do Supabase |
| Template aparece sem formatação | Supabase strip some CSS — é normal para preview; no Gmail aparece correctamente |
