# 🔐 Cofre de Senhas

API de autenticação e gerenciador de senhas pessoal, construído em Node.js com PostgreSQL. Projeto desenvolvido para estudo e portfólio, cobrindo desde autenticação tradicional até login social com OAuth 2.0.

![Status](https://img.shields.io/badge/status-concluído-brightgreen)

## ✨ Funcionalidades

- **Cadastro e login** com senha criptografada via `bcrypt`
- **Autenticação JWT** para proteger rotas privadas
- **Login com Google (OAuth 2.0)** via Passport.js
- **Cofre de senhas**: cadastro, listagem, revelação e exclusão de senhas de outros sites, protegidas por criptografia **AES-256-GCM reversível**
- **Validações**: e-mail duplicado, formato de e-mail, tamanho mínimo de senha
- **Interface web** própria (HTML/CSS/JS puro), com tema visual escuro inspirado em cofres físicos

## 🧠 Conceitos aplicados

Esse projeto foi construído como estudo prático dos seguintes conceitos:

| Conceito | Onde é usado |
|---|---|
| Hash (irreversível) | Senhas de login, via `bcrypt` |
| Criptografia reversível | Senhas guardadas no cofre, via `crypto` (AES-256-GCM) |
| Autenticação stateless | Tokens JWT em rotas protegidas |
| OAuth 2.0 | Login social com Google, via Passport.js |
| Middleware Express | Verificação de token antes de liberar rotas privadas |
| Banco relacional | PostgreSQL, com relação entre usuários e senhas salvas |

## 🛠️ Tecnologias

**Back-end:** Node.js, Express, PostgreSQL (`pg`), bcrypt, jsonwebtoken, Passport.js (`passport-google-oauth20`), dotenv

**Front-end:** HTML, CSS e JavaScript puro (sem frameworks)

## 📁 Estrutura do projeto

```
api-autenticacao/
├── public/                  # Front-end (servido pelo Express)
│   ├── index.html           # Tela de login/registro
│   ├── dashboard.html       # Área logada (cofre de senhas)
│   ├── style.css
│   ├── auth.js
│   └── dashboard.js
├── src/
│   ├── config/
│   │   └── passport.js      # Estratégia OAuth do Google
│   ├── controllers/
│   │   ├── authController.js
│   │   └── cofreController.js
│   ├── middlewares/
│   │   └── verificarToken.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── cofreRoutes.js
│   ├── sql/                 # Scripts de criação das tabelas
│   ├── utils/
│   │   └── crypto.js        # Criptografia AES-256 reversível
│   ├── db.js                # Conexão com PostgreSQL
│   └── server.js
├── .env.example
└── package.json
```

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js instalado
- PostgreSQL instalado e rodando
- Uma conta no [Google Cloud Console](https://console.cloud.google.com/) (apenas se for usar o login com Google)

### Passo a passo

1. Clone o repositório
```bash
git clone https://github.com/RuanF2/cofre-de-senhas.git
cd cofre-de-senhas
```

2. Instale as dependências
```bash
npm install
```

3. Crie o banco de dados no PostgreSQL e rode os scripts SQL da pasta `src/sql/`

4. Copie o arquivo de exemplo de variáveis de ambiente e preencha com seus dados
```bash
cp .env.example .env
```

Variáveis necessárias:
```
JWT_SECRET=
PORT=3000
DB_USER=
DB_HOST=
DB_NAME=
DB_PASSWORD=
DB_PORT=5432
CRYPTO_SECRET=       # 64 caracteres hexadecimais (32 bytes) — gere com o comando abaixo
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=
```

Para gerar a `CRYPTO_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Rode o servidor
```bash
npx nodemon src/server.js
```

6. Acesse no navegador
```
http://localhost:3000
```

## 🔑 Endpoints principais

| Método | Rota | Descrição | Protegida? |
|---|---|---|---|
| POST | `/auth/register` | Cria uma conta nova | Não |
| POST | `/auth/login` | Autentica e retorna um token JWT | Não |
| GET | `/auth/google` | Inicia o login via Google | Não |
| GET | `/auth/google/callback` | Callback do OAuth do Google | Não |
| GET | `/auth/perfil` | Retorna dados do usuário logado | Sim |
| POST | `/cofre` | Salva uma nova senha no cofre | Sim |
| GET | `/cofre` | Lista as senhas salvas (sem revelar valores) | Sim |
| GET | `/cofre/:id/revelar` | Descriptografa e retorna uma senha específica | Sim |
| DELETE | `/cofre/:id` | Remove uma senha do cofre | Sim |

Rotas protegidas exigem o header:
```
Authorization: Bearer SEU_TOKEN_AQUI
```

## 🔒 Sobre a segurança

- Senhas de **login** nunca são armazenadas em texto puro — apenas seus hashes (`bcrypt`, irreversível)
- Senhas guardadas no **cofre** são criptografadas com AES-256-GCM (reversível), pois o usuário precisa poder visualizá-las depois
- A chave de criptografia (`CRYPTO_SECRET`) fica apenas no servidor, nunca no banco de dados

Projeto desenvolvido como estudo prático de autenticação, segurança e integração back-end/front-end.
