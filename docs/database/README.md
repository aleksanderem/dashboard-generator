# Schemat bazy danych

Dashboard Generator używa SQLite jako bazy danych. Plik bazy: `backend/dashboards.db`.

## Tabele

### sessions

Przechowuje sesje użytkowników.

```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  session_key TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT
);
```

| Kolumna | Typ | Opis |
|---------|-----|------|
| id | INTEGER | Klucz główny |
| email | TEXT | Email użytkownika (unikalna) |
| session_key | TEXT | 64-znakowy token hex (unikalna) |
| created_at | TEXT | Data utworzenia (ISO 8601) |
| expires_at | TEXT | Data wygaśnięcia (opcjonalna) |

**Indeksy:**
- `email` - UNIQUE
- `session_key` - UNIQUE

---

### dashboards

Przechowuje zapisane dashboardy.

```sql
CREATE TABLE dashboards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  data TEXT NOT NULL,
  theme TEXT,
  app_name TEXT,
  app_category TEXT,
  thumbnail TEXT,
  session_key TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

| Kolumna | Typ | Opis |
|---------|-----|------|
| id | INTEGER | Klucz główny |
| name | TEXT | Nazwa dashboardu |
| data | TEXT | JSON z widgetami i layoutem |
| theme | TEXT | Nazwa motywu (np. "blue") |
| app_name | TEXT | Nazwa aplikacji |
| app_category | TEXT | Kategoria (itsm, security, etc.) |
| thumbnail | TEXT | Base64 PNG miniatury |
| session_key | TEXT | Powiązanie z sesją (opcjonalne) |
| created_at | TEXT | Data utworzenia |
| updated_at | TEXT | Data ostatniej modyfikacji |

**Struktura `data` (JSON):**

```json
{
  "widgets": [
    {
      "id": "widget-1",
      "type": "SimpleKPI",
      "props": {
        "title": "Users",
        "value": "1,234",
        "skeleton": "semi"
      }
    }
  ],
  "gridLayout": [
    { "i": "widget-1", "x": 0, "y": 0, "w": 4, "h": 4 }
  ],
  "theme": "blue",
  "metadata": {
    "appName": "Analytics",
    "appCategory": "monitoring",
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Kategorie `app_category`:**

| Wartość | Opis |
|---------|------|
| `itsm` | IT Service Management |
| `security` | Bezpieczeństwo |
| `monitoring` | Monitoring |
| `ad` | Active Directory |
| `uem` | Unified Endpoint Management |
| `custom` | Niestandardowa |

---

### widget_configs

Konfiguracja widgetów per sesja.

```sql
CREATE TABLE widget_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_key TEXT NOT NULL,
  widget_type TEXT NOT NULL,
  skeleton_mode TEXT DEFAULT 'semi',
  min_columns INTEGER DEFAULT 4,
  available_in_random INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(session_key, widget_type)
);
```

| Kolumna | Typ | Opis |
|---------|-----|------|
| id | INTEGER | Klucz główny |
| session_key | TEXT | Klucz sesji |
| widget_type | TEXT | Nazwa komponentu (np. "SimpleKPI") |
| skeleton_mode | TEXT | Tryb skeleton (none/title/semi/full) |
| min_columns | INTEGER | Minimalna szerokość (1-12) |
| available_in_random | INTEGER | 0/1 - dostępny w generatorze |
| created_at | TEXT | Data utworzenia |
| updated_at | TEXT | Data modyfikacji |

**Constraint:**
- `UNIQUE(session_key, widget_type)` - jedna konfiguracja per widget per sesja

---

### user_preferences

Preferencje użytkownika (badge'e, motywy, ustawienia).

```sql
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_key TEXT UNIQUE NOT NULL,
  preferences TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

| Kolumna | Typ | Opis |
|---------|-----|------|
| id | INTEGER | Klucz główny |
| session_key | TEXT | Klucz sesji (unikalna) |
| preferences | TEXT | JSON z preferencjami |
| created_at | TEXT | Data utworzenia |
| updated_at | TEXT | Data modyfikacji |

**Struktura `preferences` (JSON):**

```json
{
  "defaultBadgeText": "Dashboard",
  "customBadges": [
    { "name": "ITSM", "color": "#9333EA" }
  ],
  "customThemes": [
    {
      "name": "Corporate",
      "primary": "#1E40AF",
      "primaryLight": "#DBEAFE",
      "primaryDark": "#1E3A8A"
    }
  ],
  "minHeightSettings": {
    "cols2": { "mode": "auto", "value": 7 },
    "rows2": { "mode": "manual", "value": 7 }
  }
}
```

---

## Relacje

```
sessions
    │
    └── session_key ──────┬──> widget_configs (1:N)
                          │
                          ├──> user_preferences (1:1)
                          │
                          └──> dashboards (1:N, opcjonalnie)
```

## Operacje CRUD

### Inicjalizacja

```javascript
// database.js
const db = new Database('dashboards.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (...);
  CREATE TABLE IF NOT EXISTS dashboards (...);
  CREATE TABLE IF NOT EXISTS widget_configs (...);
  CREATE TABLE IF NOT EXISTS user_preferences (...);
`);
```

### Przykłady zapytań

**Pobierz dashboard:**
```sql
SELECT * FROM dashboards WHERE id = ?
```

**Lista dashboardów:**
```sql
SELECT id, name, theme, app_name, app_category, created_at, updated_at
FROM dashboards
ORDER BY updated_at DESC
```

**Konfiguracja widgetów dla sesji:**
```sql
SELECT widget_type, skeleton_mode, min_columns, available_in_random
FROM widget_configs
WHERE session_key = ?
```

**Preferencje użytkownika:**
```sql
SELECT preferences FROM user_preferences WHERE session_key = ?
```

## Backup i migracja

### Backup

```bash
cp backend/dashboards.db backend/dashboards.db.backup
```

### Eksport do SQL

```bash
sqlite3 backend/dashboards.db .dump > backup.sql
```

### Import z SQL

```bash
sqlite3 backend/dashboards.db < backup.sql
```

## Wydajność

Dla typowego użycia (< 1000 dashboardów) SQLite jest wystarczający:

- Szybkie odczyty (indeksy na kluczach)
- Atomowe zapisy
- Brak potrzeby serwera DB
- Łatwy backup (jeden plik)

Dla większej skali rozważ migrację do PostgreSQL/MySQL.

## Bezpieczeństwo

- Session keys: 256-bit entropia
- Brak haseł (email-based auth)
- Thumbnail: Base64 (może być duży)
- Dane JSON: brak walidacji schematu

### Rekomendacje

1. Regularny backup pliku `.db`
2. Ograniczenie dostępu do serwera
3. HTTPS dla API
4. Walidacja danych wejściowych
