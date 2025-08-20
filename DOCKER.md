# Docker - api-perforaciones

Perfiles disponibles: `dev` y `prod` (via docker compose profiles).

## Desarrollo
- Servicios: proxy-perforaciones (Nginx), server-perforaciones (Node dev), mongo-perforaciones
- Puertos host:
  - Nginx: http://localhost:3001
  - API directa: http://localhost:3016
  - MongoDB: localhost:27021

Comandos (cmd.exe):

```
cd "c:\\Users\\JTosman\\Documents\\Mis Trabajos\\api-perforaciones"
docker compose --profile dev up -d --build
```

Logs:
```
docker compose --profile dev logs -f
```

Apagar:
```
docker compose --profile dev down -v
```

## Producción
- Servicios: proxy-perforaciones-prod, server-perforaciones-prod, mongo-perforaciones-prod
- Puertos host:
  - Nginx: http://localhost:3002
  - API directa (opcional expuesta): http://localhost:3017
  - MongoDB: localhost:27022

Comandos:
```
cd "c:\\Users\\JTosman\\Documents\\Mis Trabajos\\api-perforaciones"
docker compose --profile prod up -d --build
```

Apagar producción:
```
docker compose --profile prod down -v
```

## Variables de entorno
Las variables requeridas se inyectan vía docker-compose. Si quieres usar `.env.development.local` o `.env.production.local` dentro del contenedor, añade un bloque `env_file:` o extiende `environment:` según necesidad.

- PORT
- NODE_ENV
- DB_HOST
- DB_PORT
- DB_DATABASE
- DB_USERNAME
- DB_PASSWORD
- (Opcional) ORIGIN, LOG_FORMAT, etc.

## Troubleshooting
- bcrypt build: ya forzamos `--build-from-source` en Dockerfile; en Apple Silicon/Windows WSL puede requerir `--unsafe-perm` (está contemplado).
- Conexión Mongo: verifica que `DB_HOST` apunte al nombre del servicio de Mongo del mismo perfil (`mongo-perforaciones` o `mongo-perforaciones-prod`).
- CORS: define `ORIGIN` en `environment` si necesitas autorizar un frontend específico.
- Cambios en código (perfil dev): están bind-mount a `/app` y usan nodemon; los cambios recargan automáticamente.
