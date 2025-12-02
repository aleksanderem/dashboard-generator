# RunCloud Setup Guide dla Dashboard Generator

Aplikacja będzie dostępna pod adresem: **dashboards.tytan.kolabogroup.pl**

## Struktura Projektu

```
/home/dashboards/webapps/dashboards/dashboard-generator/
├── frontend/
│   └── dist/              # Zbudowana aplikacja React (static files)
├── backend/
│   ├── server.js          # Backend API (port 3001)
│   └── .env              # Konfiguracja (ANTHROPIC_API_KEY, PORT, etc.)
├── ecosystem.config.js    # PM2 configuration
└── logs/                 # Logi aplikacji
```

## Konfiguracja RunCloud

### 1. Web Application Settings

**Basic Settings:**
- **Web Application Name:** dashboard-generator
- **Domain Name:** dashboards.tytan.kolabogroup.pl
- **Public Path:** `/home/dashboards/webapps/dashboards/dashboard-generator/frontend/dist`

### 2. Nginx Configuration

W RunCloud, dodaj następującą konfigurację Nginx (Settings → Nginx Config):

```nginx
# Proxy dla API backendu
location /api {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 60s;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
}

# Upload endpoint
location /upload {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Limity dla uploadów obrazów
    client_max_body_size 10M;
    proxy_read_timeout 120s;
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
}

# Static files - SPA fallback
location / {
    try_files $uri $uri/ /index.html;
}
```

### 3. Process Manager - Backend

RunCloud używa Supervisor lub możesz użyć PM2.

#### Opcja A: PM2 (Recommended)

1. Zainstaluj PM2 globalnie (jeśli nie masz):
```bash
npm install -g pm2
```

2. Uruchom backend:
```bash
cd /home/dashboards/webapps/dashboards/dashboard-generator
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

3. Sprawdź status:
```bash
pm2 status
pm2 logs dashboard-generator-backend
```

#### Opcja B: Supervisor (RunCloud)

Stwórz nowy Process w RunCloud:

**Process Settings:**
- **Name:** dashboard-generator-backend
- **User:** dashboards
- **Command:** `/usr/bin/node /home/dashboards/webapps/dashboards/dashboard-generator/backend/server.js`
- **Working Directory:** `/home/dashboards/webapps/dashboards/dashboard-generator/backend`
- **Auto Restart:** Yes

### 4. Environment Variables

Upewnij się, że plik `.env` w katalogu `backend/` ma poprawne wartości:

```env
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://dashboards.tytan.kolabogroup.pl
```

### 5. SSL Certificate

W RunCloud, włącz SSL dla domeny:
- Settings → SSL/TLS
- Wybierz "Let's Encrypt SSL"
- Aplikuj dla `dashboards.tytan.kolabogroup.pl`

### 6. File Permissions

Ustaw odpowiednie uprawnienia:

```bash
cd /home/dashboards/webapps/dashboards/dashboard-generator
chown -R dashboards:dashboards .
chmod -R 755 frontend/dist
chmod -R 755 backend
chmod 600 backend/.env
mkdir -p uploads logs
chmod 755 uploads logs
```

## Testowanie

### 1. Sprawdź backend:
```bash
curl http://localhost:3001/api/health
# Powinno zwrócić: {"status":"ok","message":"Dashboard AI Generator API is running"}
```

### 2. Sprawdź frontend:
Otwórz w przeglądarce: `https://dashboards.tytan.kolabogroup.pl`

### 3. Sprawdź logi:
```bash
# PM2
pm2 logs dashboard-generator-backend

# lub
tail -f /home/dashboards/webapps/dashboards/dashboard-generator/logs/backend-combined.log
```

## Restart Aplikacji

### Po zmianach w backendzie:
```bash
pm2 restart dashboard-generator-backend
```

### Po zmianach w frontendzie:
```bash
cd /home/dashboards/webapps/dashboards/dashboard-generator/frontend
npm run build
```

### Restart Nginx:
W RunCloud: Services → Nginx → Restart

## Troubleshooting

### Backend nie startuje:
```bash
# Sprawdź logi
pm2 logs dashboard-generator-backend --lines 100

# Sprawdź czy port 3001 jest wolny
netstat -tlnp | grep 3001

# Test manualny
cd /home/dashboards/webapps/dashboards/dashboard-generator/backend
node server.js
```

### 502 Bad Gateway:
- Sprawdź czy backend działa: `pm2 status`
- Sprawdź logi nginx: `/var/log/nginx/error.log`
- Sprawdź konfigurację proxy w nginx

### CORS errors:
- Upewnij się że `ALLOWED_ORIGINS` w `.env` zawiera `https://dashboards.tytan.kolabogroup.pl`
- Restart backend po zmianie `.env`

### Upload nie działa:
- Sprawdź `client_max_body_size` w nginx (powinno być min. 10M)
- Sprawdź uprawnienia do katalogu `uploads/`
- Sprawdź logi backendu

## Quick Commands

```bash
# Status
pm2 status

# Restart
pm2 restart dashboard-generator-backend

# Logi
pm2 logs dashboard-generator-backend

# Build frontend
cd /home/dashboards/webapps/dashboards/dashboard-generator/frontend && npm run build

# Test backend
curl http://localhost:3001/api/health
```

## Updates

### Aktualizacja kodu:
```bash
cd /home/dashboards/webapps/dashboards/dashboard-generator
git pull
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart dashboard-generator-backend
```

---

**Aplikacja gotowa do uruchomienia!** 🚀
