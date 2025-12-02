# Database Debug Guide

## Status Bazy Danych

**Lokalizacja:** `/home/dashboards/webapps/dashboards/dashboard-generator/backend/dashboards.db`
**Rozmiar:** 12K
**Uprawnienia:** `dashboards:dashboards` ✓
**Status:** Zainicjalizowana ✓

## Sprawdzanie Bazy Danych

### 1. Sprawdź schemat tabeli:
```bash
sqlite3 ~/webapps/dashboards/dashboard-generator/backend/dashboards.db ".schema"
```

### 2. Sprawdź zawartość:
```bash
sqlite3 ~/webapps/dashboards/dashboard-generator/backend/dashboards.db "SELECT * FROM dashboards;"
```

### 3. Policz rekordy:
```bash
sqlite3 ~/webapps/dashboards/dashboard-generator/backend/dashboards.db "SELECT COUNT(*) FROM dashboards;"
```

### 4. Sprawdź ostatnie dodane:
```bash
sqlite3 ~/webapps/dashboards/dashboard-generator/backend/dashboards.db "SELECT id, name, created_at FROM dashboards ORDER BY created_at DESC LIMIT 5;"
```

## Typowe Problemy

### Problem: "Database locked"
**Przyczyna:** Inny proces trzyma blokadę

**Rozwiązanie:**
```bash
# Sprawdź procesy PM2
pm2 list

# Restart backendu
pm2 restart dashboard-generator-backend
```

### Problem: Nie można zapisać dashboardów
**Przyczyna:** Brak uprawnień do zapisu

**Rozwiązanie:**
```bash
# Sprawdź uprawnienia
ls -l ~/webapps/dashboards/dashboard-generator/backend/dashboards.db

# Napraw jeśli potrzeba
chmod 644 ~/webapps/dashboards/dashboard-generator/backend/dashboards.db
chown dashboards:dashboards ~/webapps/dashboards/dashboard-generator/backend/dashboards.db
```

### Problem: API endpoint nie działa
**Sprawdź:**
```bash
# Test save endpoint
curl -X POST https://dashboards.tytan.kolabogroup.pl/api/dashboards/save \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","data":"{}","theme":"teal"}'

# Test list endpoint
curl https://dashboards.tytan.kolabogroup.pl/api/dashboards

# Test get specific dashboard
curl https://dashboards.tytan.kolabogroup.pl/api/dashboards/1
```

## API Endpoints Bazy Danych

### GET /api/dashboards
Lista wszystkich zapisanych dashboardów

### GET /api/dashboards/:id
Pobierz konkretny dashboard

### POST /api/dashboards/save
Zapisz nowy dashboard lub zaktualizuj istniejący

Body:
```json
{
  "name": "My Dashboard",
  "data": "{...dashboard_data...}",
  "theme": "teal",
  "app_name": "Analytics",
  "app_category": "Business"
}
```

### DELETE /api/dashboards/:id
Usuń dashboard

## Logi Backendu

### Sprawdź błędy związane z bazą danych:
```bash
pm2 logs dashboard-generator-backend | grep -i database
pm2 logs dashboard-generator-backend | grep -i error
```

### Pełne logi:
```bash
pm2 logs dashboard-generator-backend --lines 100
```

## Backup Bazy Danych

### Utwórz backup:
```bash
cp ~/webapps/dashboards/dashboard-generator/backend/dashboards.db \
   ~/webapps/dashboards/dashboard-generator/backend/dashboards.db.backup-$(date +%Y%m%d-%H%M%S)
```

### Przywróć z backupu:
```bash
cp ~/webapps/dashboards/dashboard-generator/backend/dashboards.db.backup-YYYYMMDD-HHMMSS \
   ~/webapps/dashboards/dashboard-generator/backend/dashboards.db
pm2 restart dashboard-generator-backend
```

## Recreate Database (Usuń wszystko)

**UWAGA: To usunie wszystkie zapisane dashboardy!**

```bash
# Stop backendu
pm2 stop dashboard-generator-backend

# Backup starej bazy
mv ~/webapps/dashboards/dashboard-generator/backend/dashboards.db \
   ~/webapps/dashboards/dashboard-generator/backend/dashboards.db.old

# Start backendu - nowa baza zostanie utworzona automatycznie
pm2 start dashboard-generator-backend

# Sprawdź logi
pm2 logs dashboard-generator-backend
```

## Debug w Przeglądarce

1. Otwórz DevTools (F12)
2. Przejdź do zakładki **Network**
3. Spróbuj zapisać dashboard
4. Sprawdź request do `/api/dashboards/save`
5. Sprawdź response - powinien być status 200 lub 201

Jeśli widzisz błąd, sprawdź:
- Console (zakładka Console w DevTools)
- Response body (kliknij na request w Network)

## Przydatne Komendy

```bash
# Backend status
pm2 status dashboard-generator-backend

# Backend restart
pm2 restart dashboard-generator-backend

# Logi na żywo
pm2 logs dashboard-generator-backend

# Health check
curl http://localhost:3001/api/health

# Sprawdź czy backend odpowiada
curl http://localhost:3001/api/dashboards
```
