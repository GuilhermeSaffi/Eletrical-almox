
# ⚡ Eletrical System - Stack Documentation

Bem-vindo ao guia de implantação do **Eletrical System**. Esta aplicação utiliza uma stack moderna baseada em **Node.js 24** e **PostgreSQL 17**, totalmente containerizada com Docker.

## 🚀 Como Subir a Aplicação

Certifique-se de ter o [Docker](https://docs.docker.com/get-docker/) e o [Docker Compose](https://docs.docker.com/compose/install/) instalados.

1.  **Configurar Chave API**:
    Crie um arquivo `.env` na raiz ou exporte a variável:
    ```bash
    export API_KEY=sua_chave_gemini_aqui
    ```

2.  **Iniciar a Stack**:
    Execute o comando abaixo no terminal:
    ```bash
    docker-compose up -d --build
    ```

3.  **Acessar**:
    A aplicação estará disponível em: `http://localhost:3000`

---

## 🔑 Credenciais e Configurações (Padrão)

### Aplicação (Login inicial)
- **E-mail Admin**: `admin@eletricalsystem.com`
- **Senha**: `admin`

### Banco de Dados (PostgreSQL)
- **Host**: `db` (dentro da rede Docker) ou `localhost` (externo)
- **Porta**: `5432`
- **Usuário**: `eletrical_admin`
- **Senha**: `system_secure_pass`
- **Banco**: `eletrical_db`

---

## 🛠 Comandos Úteis

- **Ver Logs**: `docker-compose logs -f app`
- **Parar Tudo**: `docker-compose down`
- **Resetar Banco de Dados**: `docker-compose down -v` (Cuidado: apaga todos os dados!)
- **Acessar Terminal do Banco**: `docker exec -it eletrical_system_db psql -U eletrical_admin -d eletrical_db`

---

## 📁 Estrutura da Stack
- **Frontend**: React 19 + Tailwind CSS (Vite)
- **Runtime**: Node.js 24 (Debian Slim)
- **Database**: PostgreSQL 17 (Alpine Linux)
- **Insights**: Google Gemini AI API

---
*Eletrical System Management Suite - v3.2*


## Merged package
This package combines the new frontend with the previous backend (api + postgres).
Run: docker compose up -d --build
Open: http://<server-ip>:3000/
