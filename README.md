# Chatterbox Backend (Docker)

Backend API with Express + Socket.IO + MongoDB + Redis, run via Docker Compose.

## Stack

- Node.js app: `http://localhost:3000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`
- Mongo Express: `http://localhost:8081`
- RedisInsight: `http://localhost:5540`

## Prerequisites (Windows + WSL)

1. Install Docker Desktop on Windows.
2. Enable WSL2 in Docker Desktop:
   - `Settings -> General -> Use the WSL 2 based engine`
3. Enable your distro integration:
   - `Settings -> Resources -> WSL Integration -> Enable integration with your distro`
4. Open project in WSL terminal (Ubuntu, Debian, etc.).
5. Verify Docker from WSL:

```bash
docker --version
docker compose version
```

If these fail inside WSL, Docker Desktop is either not running or WSL integration is not enabled.

## Run (Development)

From `chatterbox-backend/`:

```bash
docker compose up --build -d
```

Check status:

```bash
docker compose ps
docker compose logs -f app
```

Expected app logs include:
- `MongoDB connected`
- `Redis connected`
- `Server running on port 3000`
- `Socket.IO ready`

## Verify Services

### API

```bash
curl -i http://localhost:3000/
```

Expected: `200 OK` and body `Server is running!`

### Health Check (Mongo + Redis + Socket.IO)

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok","services":{"mongo":"up","redis":"up","socketIo":"up"},"socketConnections":0}
```

### Socket.IO Handshake

```bash
curl "http://localhost:3000/socket.io/?EIO=4&transport=polling"
```

Expected: Engine.IO open packet with `sid`.

## Stop

```bash
docker compose down
```

## Reset (containers + volumes for this project)

```bash
docker compose down --volumes --remove-orphans
```

This removes project containers/networks/volumes (including DB data).

## Optional Cleanup of Project Images

```bash
docker compose down --rmi local --volumes --remove-orphans
```

Use `--rmi local` to remove only locally built project images.
Avoid `--rmi all` unless you explicitly want pulled base/service images removed from local cache.

## Common Troubleshooting

### `permission denied` on Docker socket in WSL

- Ensure Docker Desktop is running on Windows.
- Ensure WSL integration is enabled for your distro.
- Restart WSL:

```bash
wsl.exe --shutdown
```

Then reopen terminal and retry.

### Port already in use

If `3000`, `27017`, `6379`, `8081`, or `5540` are busy, stop conflicting services or change port mappings in `docker-compose.yml`.

### App starts but health is degraded

Check app logs:

```bash
docker compose logs -f app
```

Then verify Mongo/Redis containers are up:

```bash
docker compose ps
```
