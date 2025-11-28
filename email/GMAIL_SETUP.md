# Gmail API Setup Guide

Este guia mostra como configurar o serviço de email para usar a Gmail API.

## Pré-requisitos

- Conta Google/Gmail
- Python 3.8+
- Acesso ao Google Cloud Console

## Passo 1: Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Clique em **"Select a project"** → **"New Project"**
3. Nome do projeto: `Microservices Email Service` (ou outro nome de sua preferência)
4. Clique em **"Create"**

## Passo 2: Ativar a Gmail API

1. No menu lateral, vá em **"APIs & Services"** → **"Library"**
2. Pesquise por **"Gmail API"**
3. Clique em **"Gmail API"**
4. Clique em **"Enable"**

## Passo 3: Criar Credenciais OAuth 2.0

1. No menu lateral, vá em **"APIs & Services"** → **"Credentials"**
2. Clique em **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Se solicitado, configure a **OAuth consent screen**:
   - User Type: **External**
   - App name: `Microservices Email`
   - User support email: seu email
   - Developer contact: seu email
   - Clique em **"Save and Continue"**
   - Em **Scopes**, clique em **"Add or Remove Scopes"**
   - Adicione o scope: `https://www.googleapis.com/auth/gmail.send`
   - Clique em **"Save and Continue"**
   - Em **Test users**, adicione seu email do Gmail
   - Clique em **"Save and Continue"**
4. Volte para **"Credentials"** → **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
5. Application type: **Desktop app**
6. Name: `Email Service Client`
7. Clique em **"Create"**

## Passo 4: Baixar Credenciais

1. Após criar, aparecerá um modal com suas credenciais
2. Clique em **"Download JSON"**
3. Salve o arquivo como `credentials.json` na **raiz do serviço de email**:
   ```
   email/
   ├── credentials.json  ← Aqui
   ├── app/
   ├── run.py
   └── ...
   ```

## Passo 5: Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e configure:
   ```bash
   GMAIL_CREDENTIALS_FILE=credentials.json
   GMAIL_TOKEN_FILE=token.json
   MAIL_USERNAME=seu_email@gmail.com
   ```

## Passo 6: Instalar Dependências

```bash
cd email
pip install -r requirements.txt
```

## Passo 7: Primeira Autenticação

Na primeira vez que você iniciar o serviço, será necessário autenticar:

1. Inicie o serviço:
   ```bash
   python run.py
   ```

2. Uma janela do navegador será aberta automaticamente
3. Faça login com sua conta Google
4. Você verá um aviso: **"Google hasn't verified this app"**
   - Clique em **"Advanced"**
   - Clique em **"Go to Microservices Email (unsafe)"**
5. Clique em **"Allow"** para permitir o acesso
6. Você verá: **"The authentication flow has completed"**
7. Feche a janela do navegador

Um arquivo `token.json` será criado automaticamente. Este arquivo contém o refresh token e será usado nas próximas execuções.

## Passo 8: Testar o Serviço

Envie uma requisição de teste:

```bash
curl -X POST http://localhost:3004/api/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "to": "destinatario@example.com",
    "subject": "Teste Gmail API",
    "body": "Este é um email de teste enviado via Gmail API!"
  }'
```

## Arquivos Importantes

- `credentials.json` - Credenciais OAuth2 (não commitar no Git)
- `token.json` - Refresh token (criado automaticamente, não commitar no Git)
- `.env` - Variáveis de ambiente (não commitar no Git)

## Troubleshooting

### Erro: "credentials.json not found"
- Certifique-se de que o arquivo `credentials.json` está na raiz do serviço
- Verifique o caminho no arquivo `.env`

### Erro: "invalid_grant"
- Delete o arquivo `token.json`
- Reinicie o serviço para refazer a autenticação

### Erro: "Access blocked: This app's request is invalid"
- Verifique se adicionou seu email como "Test user" na OAuth consent screen
- Certifique-se de que a Gmail API está ativada

### Erro: "Daily sending quota exceeded"
- A Gmail API tem limite de envio diário
- Para produção, considere usar um serviço dedicado como SendGrid

## Segurança

⚠️ **IMPORTANTE**: Nunca commite os seguintes arquivos no Git:
- `credentials.json`
- `token.json`
- `.env`

Adicione-os ao `.gitignore`:
```
credentials.json
token.json
.env
```
