College Rage is the ultimate "Vault of Chaos" where our questionable life choices are preserved in 4K glory

Live: https://collegerage-fzahg5ekarathpf3.southeastasia-01.azurewebsites.net

## Docker

### Prerequisites

- Docker Desktop with Compose v2
- A Neon PostgreSQL connection string
- The application credentials documented in `.env.example`

### First-time setup

Copy `.env.example` to `.env` and fill in the real values. Do not commit `.env`.

### Production-like workflow

Build and start the production images:

```text
docker compose up --build
```

Open `http://localhost:8080`. Nginx serves the client and proxies `/api` requests to the private Express container. Neon remains the database provider.

Stop the stack with:

```text
docker compose down
```

### Development workflow

Run the client and server with source mounts and hot reload:

```text
docker compose -f docker-compose.dev.yml up --build
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the server container.

Stop the development stack with:

```text
docker compose -f docker-compose.dev.yml down
```

View service logs with `docker compose logs -f server` or `docker compose logs -f client`.
