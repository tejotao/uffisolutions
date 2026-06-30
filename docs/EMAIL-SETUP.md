# Configuração de Email — Hostinger SMTP + us@uffisolutions.com + Supabase

Objetivo: emails da plataforma (confirmação de conta, reset de password)
enviados DE `us@uffisolutions.com` usando o SMTP do Hostinger (já configurado).

> Não é necessário Resend nem configuração adicional de domínio.
> O email já existe no Hostinger — basta ligar ao Supabase.

---

## PARTE 1 — Credenciais SMTP do Hostinger

### Como obter:
1. **Hostinger hPanel** → **Email** → **Email Accounts**
2. Clica nos **3 pontos** ao lado de `us@uffisolutions.com`
3. Selecciona **Configure Client** (ou "Mail Settings")
4. Procura a secção **Outgoing Mail (SMTP)**

### Credenciais (tipicamente):
```
SMTP Host:     smtp.hostinger.com
SMTP Port:     465  (SSL/TLS)  <- recomendado
               587  (STARTTLS) <- alternativa
SMTP User:     us@uffisolutions.com
SMTP Password: [password do email no Hostinger]
```

---

## PARTE 2 — Configurar Supabase Auth com Hostinger SMTP

1. **Supabase Dashboard** -> **Authentication** -> **Settings**
2. Seccao **SMTP Settings** -> activa **Enable Custom SMTP**
3. Preenche os campos:

| Campo | Valor |
|---|---|
| Host | `smtp.hostinger.com` |
| Port | `465` |
| Username | `us@uffisolutions.com` |
| Password | `[password do Hostinger]` |
| Sender name | `UffiSolutions` |
| Sender email | `us@uffisolutions.com` |

4. Clica **Save**

---

## PARTE 3 — URL Configuration no Supabase

1. **Supabase** -> **Authentication** -> **URL Configuration**
2. Preenche:

```
Site URL:     https://uffisolutions.com

Redirect URLs (adiciona todos):
  https://uffisolutions.com/**
  http://localhost:3000/**
  http://localhost:5180/**
```

3. Clica **Save**

---

## PARTE 4 — Colar os templates de email

Os ficheiros HTML estao em `docs/email-templates/`

### Confirmacao de conta
1. **Supabase** -> **Authentication** -> **Email Templates** -> **Confirm signup**
2. **Subject:** `Confirm your UffiSolutions account`
3. **Body:** abre `docs/email-templates/email-confirmation.html` -> copia todo o conteudo -> cola aqui
4. Clica **Save**

### Reset de password
1. Selecciona **Reset password**
2. **Subject:** `Reset your UffiSolutions password`
3. **Body:** abre `docs/email-templates/password-reset.html` -> copia todo o conteudo -> cola aqui
4. Clica **Save**

> A variavel `{{ .ConfirmationURL }}` nos templates e substituida automaticamente pelo Supabase.

---

## PARTE 5 — Testar

### Teste de confirmacao de conta:
1. Abre `/register` -> regista um email de teste
2. Verifica a caixa de entrada
3. Deve chegar DE `us@uffisolutions.com` com o template personalizado

### Teste de reset de password:
1. Abre `/login` -> clica "Forgot password?" -> insere o email
2. Verifica a caixa de entrada
3. Clica o link -> deve abrir `https://uffisolutions.com/reset-password`
4. Define nova password -> redirecionado para login automaticamente

---

## Checklist

- [ ] Credenciais SMTP obtidas no hPanel do Hostinger
- [ ] Supabase SMTP configurado e guardado
- [ ] Site URL: `https://uffisolutions.com`
- [ ] Redirect URLs adicionados
- [ ] Template "Confirm signup" colado e guardado
- [ ] Template "Reset password" colado e guardado
- [ ] Teste de registo -> email recebido com branding correcto
- [ ] Teste de reset -> link abre `/reset-password` e funciona end-to-end

---

## Troubleshooting

| Problema | Solucao |
|---|---|
| Email nao chega | Verifica que o SMTP esta enabled; confirma password do Hostinger |
| Erro de autenticacao SMTP | Tenta porta 587 em vez de 465 |
| Email vai para spam | Normal nas primeiras sends; melhora com volume |
| Link de reset invalido | Verifica que `https://uffisolutions.com/reset-password` esta nos Redirect URLs |
| "Invalid login credentials" SMTP | Password do Hostinger pode ter caracteres especiais — verifica no hPanel |
