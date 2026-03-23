# Setup Dev — HTTPS Local

## Prérequis

- Docker + Docker Compose installés
- zsh (ou bash)
- Chrome/Brave/Firefox

---

## 1. Installer mkcert (sans sudo)

```bash
mkdir -p ~/.local/bin

curl -JLo ~/.local/bin/mkcert "https://dl.filippo.io/mkcert/latest?for=linux/amd64"

chmod +x ~/.local/bin/mkcert

echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Vérifier
mkcert --version
```

---

## 2. Générer les certificats

```bash
# Depuis la racine du projet
mkdir -p infra/certs
cd infra/certs

mkcert -install
mkcert localhost 127.0.0.1

mv localhost+1.pem dev.crt
mv localhost+1-key.pem dev.key

cd ../..
```

> ⚠️ Le warning `failed to execute "tee"` est normal sans sudo — les certs sont quand même générés.

---

## 3. Importer la CA dans Chrome

Dans la barre d'adresse Chrome :

```
chrome://certificate-manager/localcerts/usercerts
```
1. Sélectionner `~/.local/share/mkcert/rootCA.pem`
2. Cocher **"Faire confiance pour identifier les sites web"**
3. **OK**

> À faire **une seule fois**. Chrome s'en souvient même après un `make re`.

---

## 4. Modifier `infra/nginx/nginx.dev.conf`

```nginx
events { worker_connections 1024; }
http {
  server {
    listen 80;
    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate     /etc/nginx/certs/dev.crt;
    ssl_certificate_key /etc/nginx/certs/dev.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:SSL:10m;

    location /api/ {
      proxy_pass http://backend:3000;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-Proto https;
    }

    location / {
      proxy_pass http://frontend:5173;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host $host;
    }
  }
}
```

---

## 5. Modifier `docker-compose.dev.yml`

```yaml
services:
  backend:
    build:
      target: development
    environment:
      NODE_ENV: development
    volumes:
      - ./apps/backend:/app/apps/backend
      - ./packages/shared/src:/app/packages/shared/src

  postgres:
    ports:
      - "5432:5432"

  frontend:
    build:
      target: development
    environment:
      NODE_ENV: development
    volumes:
      - ./apps/frontend:/app/apps/frontend
      - ./packages/shared/src:/app/packages/shared/src

  nginx:
    volumes:
      - ./infra/nginx/nginx.dev.conf:/etc/nginx/nginx.conf:ro
      - ./infra/certs:/etc/nginx/certs:ro
    ports:
      - "8080:80"
      - "8443:443"
```

---

## 6. Mettre à jour `.env`

```env
CORS_ORIGIN=https://localhost:8443
```

---

## 7. Ajouter au `.gitignore`

```gitignore
infra/certs/
```

---

## 8. Lancer

```bash
make re
```

Ouvrir **`https://localhost:8443`** → cadenas vert ✅

---

## Résumé des fichiers modifiés

| Fichier | Action |
|---|---|
| `infra/certs/dev.crt` + `dev.key` | Générés par mkcert |
| `infra/nginx/nginx.dev.conf` | Ajout serveur 443 + redirect 80→443 |
| `docker-compose.dev.yml` | Mount des certs + port 8443 |
| `.env` | CORS_ORIGIN mis à jour |
| `.gitignore` | `infra/certs/` ignoré |


# prod

# Lance uniquement nginx
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d nginx

# Demande le certificat à Let's Encrypt
docker run --rm \
  -v $(pwd)/infra/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/infra/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email lzozolezozo@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d fcretin.ddns.net


  make prod
```

`https://freecretin.ddns.net` — cadenas vert, certificat officiel ✅

---

## Résumé de l'ordre
```
1. mkdir certbot/conf + www
2. nginx.prod.conf version initiale (sans SSL)
3. docker-compose.prod.yml
4. docker compose up -d nginx    ← nginx seul
5. docker run certbot certonly   ← obtenir les certs
6. nginx.prod.conf version finale (avec SSL)
7. make prod                     ← tout démarre