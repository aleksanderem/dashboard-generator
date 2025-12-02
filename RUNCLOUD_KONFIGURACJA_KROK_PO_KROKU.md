# RunCloud - Konfiguracja Krok po Kroku
## Dashboard Generator - dashboards.tytan.kolabogroup.pl

---

## ✅ AKTUALNY STATUS

- **Backend:** Działa na porcie **3001**
- **Frontend:** Zbudowany w `frontend/dist/`
- **PM2:** Zarządza backendem (auto-restart)
- **Użytkownik:** dashboards

Sprawdź: `curl http://localhost:3001/api/health`

---

## 📋 KONFIGURACJA RUNCLOUD

### KROK 1: Utwórz Web Application

1. Zaloguj się do RunCloud Dashboard
2. Wybierz swój serwer
3. Kliknij **"Web Applications"** → **"+ Add Web Application"**

**Ustawienia:**
```
Application Name: dashboard-generator
Domain Name: dashboards.tytan.kolabogroup.pl
Public Path: /home/dashboards/webapps/dashboards/dashboard-generator/frontend/dist
User: dashboards
PHP Version: None/Disabled (to aplikacja Node.js, nie PHP!)
```

4. Kliknij **"Add Web Application"**

---

### KROK 2: Konfiguracja Nginx (Reverse Proxy)

Po utworzeniu aplikacji:

1. Przejdź do aplikacji **dashboard-generator**
2. Kliknij **"Settings"** → **"Nginx Config"**
3. Kliknij **"+ Add New Config"**

**Konfiguracja:**
```
Type: location.root
Name: api-proxy (lub dowolna nazwa)
```

**Config Content:**
```nginx
# API Backend Reverse Proxy
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

# Upload endpoint (dla obrazów dashboardów)
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

    # Limity dla uploadów (max 10MB)
    client_max_body_size 10M;
    proxy_read_timeout 120s;
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
}

# Static files - SPA fallback dla React Router
location / {
    try_files $uri $uri/ /index.html;
}
```

4. Kliknij **"Test Config"** aby sprawdzić składnię
5. Jeśli test OK, kliknij **"Save"**
6. Nginx zostanie automatycznie przeładowany

---

### KROK 3: SSL Certificate

1. W aplikacji **dashboard-generator** przejdź do **"Settings"** → **"SSL/TLS"**
2. Wybierz **"Let's Encrypt"**
3. Zaznacz:
   - ☑ Enable HTTPS
   - ☑ Force HTTPS (przekierowanie HTTP → HTTPS)
4. Kliknij **"Install SSL Certificate"**

RunCloud automatycznie:
- Wygeneruje certyfikat SSL
- Skonfiguruje automatyczne odnowienie
- Przekieruje ruch HTTP na HTTPS

---

### KROK 4: Weryfikacja

#### A. Sprawdź backend lokalnie:
```bash
curl http://localhost:3001/api/health
```
Powinno zwrócić: `{"status":"ok","message":"Dashboard AI Generator API is running"}`

#### B. Sprawdź PM2:
```bash
pm2 list
```
Status powinien być: **online**

#### C. Sprawdź w przeglądarce:
```
https://dashboards.tytan.kolabogroup.pl
```

Powinieneś zobaczyć interfejs aplikacji Dashboard Generator.

#### D. Sprawdź API przez przeglądarkę:
```
https://dashboards.tytan.kolabogroup.pl/api/health
```

---

## 🔧 ZARZĄDZANIE PROCESEM (PM2)

Backend jest zarządzany przez PM2 użytkownika `dashboards`:

```bash
# Jako użytkownik dashboards:
pm2 list                              # Status
pm2 logs dashboard-generator-backend  # Logi na żywo
pm2 restart dashboard-generator-backend # Restart
pm2 stop dashboard-generator-backend  # Stop
pm2 start ecosystem.config.js         # Start

# Monitoring
pm2 monit                             # Dashboard w terminalu
```

PM2 automatycznie:
- ✓ Restartuje backend przy crashu
- ✓ Startuje backend po restarcie serwera (systemd)
- ✓ Loguje wszystko do plików

---

## 📊 STRUKTURA APLIKACJI

```
Frontend (React SPA)
  ↓ HTTPS (port 443)
  ↓
Nginx (RunCloud)
  ├─→ /          → Static files (frontend/dist/)
  ├─→ /api/*     → Proxy → Backend (port 3001)
  └─→ /upload/*  → Proxy → Backend (port 3001)
        ↓
   PM2 → Node.js Backend (Express)
```

---

## 🐛 TROUBLESHOOTING

### Problem: 502 Bad Gateway

**Przyczyna:** Backend nie działa

**Rozwiązanie:**
```bash
# Sprawdź PM2
pm2 list
pm2 logs dashboard-generator-backend --lines 50

# Restart backendu
pm2 restart dashboard-generator-backend

# Sprawdź port
netstat -tlnp | grep 3001
```

### Problem: CORS errors w konsoli

**Przyczyna:** Niepoprawny ALLOWED_ORIGINS

**Rozwiązanie:**
```bash
# Edytuj .env
nano ~/webapps/dashboards/dashboard-generator/backend/.env

# Upewnij się że masz:
ALLOWED_ORIGINS=https://dashboards.tytan.kolabogroup.pl

# Restart
pm2 restart dashboard-generator-backend
```

### Problem: Upload nie działa (413 Request Entity Too Large)

**Przyczyna:** Za mały limit w nginx

**Rozwiązanie:**
- Upewnij się że w konfiguracji nginx masz:
  ```nginx
  client_max_body_size 10M;
  ```
- RunCloud → Nginx Config → Edytuj konfigurację
- Dodaj w sekcji `location /upload`

### Problem: Frontend pokazuje białą stronę

**Przyczyna:** Niepoprawny Public Path lub brak buildu

**Rozwiązanie:**
```bash
# Sprawdź czy build istnieje
ls -la ~/webapps/dashboards/dashboard-generator/frontend/dist/

# Jeśli pusty katalog, zbuduj:
cd ~/webapps/dashboards/dashboard-generator/frontend
npm run build

# Sprawdź Public Path w RunCloud
# Powinien być: /home/dashboards/webapps/dashboards/dashboard-generator/frontend/dist
```

### Problem: SSL nie działa

**Rozwiązanie:**
- Upewnij się że domena wskazuje na serwer (DNS)
- Sprawdź czy port 80 i 443 są otwarte w firewall
- Spróbuj ponownie zainstalować certyfikat w RunCloud

---

## 🔄 AKTUALIZACJA APLIKACJI

### Frontend (po zmianach w kodzie React):
```bash
cd ~/webapps/dashboards/dashboard-generator/frontend
npm install           # Jeśli zmieniły się zależności
npm run build         # Zbuduj nową wersję
# Odśwież stronę w przeglądarce (Ctrl+F5)
```

### Backend (po zmianach w kodzie Node.js):
```bash
cd ~/webapps/dashboards/dashboard-generator/backend
npm install           # Jeśli zmieniły się zależności
pm2 restart dashboard-generator-backend
pm2 logs dashboard-generator-backend  # Sprawdź logi
```

### Pełna aktualizacja (git pull):
```bash
cd ~/webapps/dashboards/dashboard-generator
git pull
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart dashboard-generator-backend
```

---

## 📝 WAŻNE PLIKI

```
~/webapps/dashboards/dashboard-generator/
├── backend/
│   ├── .env                    # Konfiguracja (PORT, ANTHROPIC_API_KEY)
│   ├── server.js               # Główny plik backendu
│   └── dashboards.db           # SQLite database (auto-tworzony)
├── frontend/
│   └── dist/                   # Zbudowane pliki (PUBLIC PATH w RunCloud)
├── ecosystem.config.js         # Konfiguracja PM2
├── logs/                       # Logi PM2
├── uploads/                    # Uploadowane obrazy
└── RUNCLOUD_KONFIGURACJA_KROK_PO_KROKU.md  # Ten plik
```

---

## ✅ CHECKLIST KONFIGURACJI

- [ ] Web Application utworzona w RunCloud
- [ ] Public Path: `/home/dashboards/webapps/dashboards/dashboard-generator/frontend/dist`
- [ ] Nginx Config dodany (reverse proxy dla /api i /upload)
- [ ] SSL Certificate zainstalowany (Let's Encrypt)
- [ ] Backend działa: `pm2 list` pokazuje **online**
- [ ] Test lokalny: `curl http://localhost:3001/api/health` → OK
- [ ] Test zdalny: `https://dashboards.tytan.kolabogroup.pl` → Aplikacja widoczna
- [ ] Test API: `https://dashboards.tytan.kolabogroup.pl/api/health` → OK

---

## 🎯 QUICK REFERENCE

| Co sprawdzić | Komenda |
|--------------|---------|
| Status backendu | `pm2 list` |
| Logi backendu | `pm2 logs dashboard-generator-backend` |
| Port 3001 | `netstat -tlnp \| grep 3001` |
| Health check | `curl http://localhost:3001/api/health` |
| Restart backendu | `pm2 restart dashboard-generator-backend` |
| Build frontendu | `cd frontend && npm run build` |
| Test nginx config | W RunCloud: Test Config przed Save |

---

**PORT BACKENDU: 3001** ← To jest kluczowe dla reverse proxy!

Dokumentacja RunCloud: https://runcloud.io/docs/install-and-run-nodejs
