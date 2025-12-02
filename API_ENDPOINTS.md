# API Endpoints - Dashboard Generator

## ✅ Wszystko działa poprawnie!

Base URL: `https://dashboards.tytan.kolabogroup.pl`

---

## Endpoints

### 1. Health Check
```bash
GET /api/health
```

**Response:**
```json
{"status":"ok","message":"Dashboard AI Generator API is running"}
```

---

### 2. Save Dashboard
```bash
POST /api/dashboards
Content-Type: application/json
```

**Body:**
```json
{
  "name": "My Dashboard",
  "dashboard": {
    "widgets": [...],
    "layout": {"type": "grid"},
    "theme": "teal"
  },
  "theme": "teal",
  "appName": "Analytics App",
  "appCategory": "Business"
}
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "_id": 1,
    "name": "My Dashboard",
    "dashboard": {...},
    "theme": "teal",
    "appName": "Analytics App",
    "appCategory": "Business",
    "createdAt": "2025-11-28T21:13:36.606Z",
    "updatedAt": "2025-11-28T21:13:36.606Z"
  }
}
```

**UWAGA:** Pole to `dashboard` (nie `data`)!

---

### 3. Get All Dashboards
```bash
GET /api/dashboards
```

**Response:**
```json
{
  "success": true,
  "dashboards": [
    {
      "_id": 1,
      "name": "My Dashboard",
      ...
    }
  ]
}
```

---

### 4. Get Single Dashboard
```bash
GET /api/dashboards/:id
```

**Example:**
```bash
curl https://dashboards.tytan.kolabogroup.pl/api/dashboards/1
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "_id": 1,
    "name": "My Dashboard",
    ...
  }
}
```

---

### 5. Update Dashboard
```bash
PUT /api/dashboards/:id
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Updated Dashboard Name",
  "dashboard": {...},
  "theme": "blue"
}
```

---

### 6. Delete Dashboard
```bash
DELETE /api/dashboards/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard deleted successfully"
}
```

---

### 7. Analyze Screenshot (AI)
```bash
POST /api/analyze
Content-Type: multipart/form-data
```

**Form Data:**
- `screenshot`: image file (PNG, JPG, max 10MB)

**Wymaga:** ANTHROPIC_API_KEY w backend/.env

---

### 8. Render Dashboard
```bash
POST /api/render-dashboard
Content-Type: application/json
```

**Body:**
```json
{
  "dashboard": {...},
  "options": {
    "width": 1200,
    "height": 800
  }
}
```

---

## Przykłady użycia

### Zapisz dashboard:
```bash
curl -X POST https://dashboards.tytan.kolabogroup.pl/api/dashboards \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Dashboard",
    "dashboard": {
      "widgets": [
        {"type": "kpi", "value": "1234"},
        {"type": "chart", "data": [...]}
      ],
      "layout": {"type": "grid"},
      "theme": "teal"
    },
    "theme": "teal",
    "appName": "Sales App",
    "appCategory": "Business"
  }'
```

### Pobierz wszystkie dashboardy:
```bash
curl https://dashboards.tytan.kolabogroup.pl/api/dashboards
```

### Pobierz konkretny dashboard:
```bash
curl https://dashboards.tytan.kolabogroup.pl/api/dashboards/1
```

### Usuń dashboard:
```bash
curl -X DELETE https://dashboards.tytan.kolabogroup.pl/api/dashboards/1
```

---

## Status Bazy Danych

✅ SQLite database: `/home/dashboards/webapps/dashboards/dashboard-generator/backend/dashboards.db`
✅ Tabela: `dashboards`
✅ Uprawnienia: `dashboards:dashboards`
✅ Zapisywanie: DZIAŁA
✅ Odczyt: DZIAŁA
✅ Aktualizacja: DZIAŁA
✅ Usuwanie: DZIAŁA

---

## Sprawdzenie bazy danych

### Via API:
```bash
curl https://dashboards.tytan.kolabogroup.pl/api/dashboards
```

### Via SQLite CLI:
```bash
sqlite3 ~/webapps/dashboards/dashboard-generator/backend/dashboards.db \
  "SELECT id, name, theme, created_at FROM dashboards;"
```

---

## Problem rozwiązany! 🎉

Początkowo myślałeś że jest problem z bazą danych, ale:
- ✅ Baza działa poprawnie
- ✅ API działa poprawnie
- ✅ Zapis działa
- ✅ Odczyt działa
- ✅ Pusta tablica `[]` była normalna (nic jeszcze nie zapisano)

Endpoint to `/api/dashboards` (nie `/api/dashboards/save`)!
