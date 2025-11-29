# Dashboardy API

Endpointy do zarządzania dashboardami - tworzenie, odczyt, aktualizacja, usuwanie.

## Lista dashboardów

### GET `/api/dashboards`

Pobiera listę wszystkich zapisanych dashboardów.

**Request:**

```http
GET /api/dashboards
```

**Response:**

```json
{
  "success": true,
  "dashboards": [
    {
      "id": 1,
      "name": "Security Dashboard",
      "theme": "blue",
      "app_name": "Security Center",
      "app_category": "security",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T12:45:00.000Z"
    }
  ]
}
```

## Pobierz dashboard

### GET `/api/dashboards/:id`

Pobiera pełne dane dashboardu.

**Request:**

```http
GET /api/dashboards/1
```

**Response:**

```json
{
  "id": 1,
  "name": "Security Dashboard",
  "data": {
    "widgets": [...],
    "gridLayout": [...],
    "theme": "blue",
    "metadata": {...}
  },
  "theme": "blue",
  "app_name": "Security Center",
  "app_category": "security",
  "thumbnail": "data:image/png;base64,...",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T12:45:00.000Z"
}
```

## Zapisz dashboard

### POST `/api/dashboards`

Tworzy nowy dashboard.

**Request:**

```http
POST /api/dashboards
Content-Type: application/json
X-Session-Key: a1b2c3d4e5f6... (opcjonalnie)

{
  "name": "My Dashboard",
  "dashboard": {
    "widgets": [
      {
        "id": "widget-1",
        "type": "SimpleKPI",
        "props": {
          "title": "Total Users",
          "value": "1,234",
          "trend": "up"
        }
      }
    ],
    "gridLayout": [
      { "i": "widget-1", "x": 0, "y": 0, "w": 3, "h": 4 }
    ],
    "theme": "teal",
    "metadata": {
      "appName": "User Analytics",
      "appCategory": "monitoring"
    }
  },
  "theme": "teal",
  "appName": "User Analytics",
  "appCategory": "monitoring",
  "thumbnail": "data:image/png;base64,..."
}
```

**Response:**

```json
{
  "success": true,
  "dashboard": {
    "id": 2,
    "name": "My Dashboard",
    ...
  }
}
```

## Aktualizuj dashboard

### PUT `/api/dashboards/:id`

Aktualizuje istniejący dashboard.

**Request:**

```http
PUT /api/dashboards/1
Content-Type: application/json

{
  "name": "Updated Dashboard Name",
  "dashboard": {...},
  "theme": "purple",
  "appName": "New App Name",
  "appCategory": "itsm",
  "thumbnail": "data:image/png;base64,..."
}
```

**Response:**

```json
{
  "success": true,
  "dashboard": {
    "id": 1,
    "name": "Updated Dashboard Name",
    ...
  }
}
```

## Usuń dashboard

### DELETE `/api/dashboards/:id`

Usuwa dashboard.

**Request:**

```http
DELETE /api/dashboards/1
```

**Response:**

```json
{
  "success": true,
  "message": "Dashboard deleted"
}
```

## Miniatury

### GET `/api/dashboards/:id/thumbnail`

Pobiera URL miniatury.

**Response:**

```json
{
  "success": true,
  "thumbnailUrl": "/api/dashboards/1/thumbnail.png",
  "dashboardId": 1,
  "dashboardName": "Security Dashboard"
}
```

### GET `/api/dashboards/:id/thumbnail.png`

Pobiera miniaturę jako plik PNG.

**Response:**

```http
Content-Type: image/png

<binary PNG data>
```

### GET `/api/dashboards/:id/render.png`

Pobiera zapisaną miniaturę (z cache).

**Response:**

```http
Content-Type: image/png
Cache-Control: public, max-age=3600

<binary PNG data>
```

## Struktura danych dashboardu

### Widget

```typescript
interface Widget {
  id: string;           // Unikalny identyfikator
  type: string;         // Typ komponentu (np. "SimpleKPI")
  props: {
    title?: string;     // Tytuł widgetu
    value?: string;     // Główna wartość
    subtitle?: string;  // Podtytuł
    skeleton?: string;  // Tryb skeleton
    // ... inne props zależne od typu
  };
}
```

### Grid Layout Item

```typescript
interface GridLayoutItem {
  i: string;    // ID widgetu
  x: number;    // Pozycja X (0-11)
  y: number;    // Pozycja Y
  w: number;    // Szerokość (1-12)
  h: number;    // Wysokość (jednostki = 30px)
}
```

### Kategorie aplikacji

| Wartość | Opis |
|---------|------|
| `itsm` | IT Service Management |
| `security` | Bezpieczeństwo |
| `monitoring` | Monitoring |
| `ad` | Active Directory |
| `uem` | Unified Endpoint Management |
| `custom` | Niestandardowa |
