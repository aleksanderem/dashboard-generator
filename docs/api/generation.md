# Generowanie dashboardów

Endpointy do automatycznego generowania dashboardów.

## Layout Presets

### GET `/api/layouts`

Pobiera dostępne predefiniowane layouty.

**Request:**

```http
GET /api/layouts
```

**Response:**

```json
{
  "success": true,
  "presets": {
    "2+2": {
      "name": "2+2",
      "description": "2 widgets top, 2 widgets bottom",
      "rows": [[2, 2], [2, 2]],
      "totalWidgets": 4
    },
    "3+3": {
      "name": "3+3",
      "description": "3 widgets per row",
      "rows": [[3, 3, 3], [3, 3, 3]],
      "totalWidgets": 6
    },
    "3+1": {
      "name": "3+1",
      "description": "3 small on top, 1 large on bottom",
      "rows": [[4, 4, 4], [12]],
      "totalWidgets": 4
    }
  }
}
```

### Dostępne presety

| Preset | Układ | Widgety |
|--------|-------|---------|
| `2+2` | 2 rzędy po 2 | 4 |
| `3+3` | 2 rzędy po 3 | 6 |
| `4+4` | 2 rzędy po 4 | 8 |
| `3+1` | 3 małe + 1 duży | 4 |
| `1+3` | 1 duży + 3 małe | 4 |
| `2+3+2` | 2-3-2 | 7 |
| `4+2` | 4 małe + 2 średnie | 6 |
| `2+4` | 2 średnie + 4 małe | 6 |
| `1+2+1` | 1-2-1 | 4 |
| `3` | 1 rząd po 3 | 3 |
| `4` | 1 rząd po 4 | 4 |
| `6` | 1 rząd po 6 | 6 |

## Generowanie z presetu

### POST `/api/generate`

Generuje dashboard na podstawie wybranego presetu.

**Wymaga:** `X-Session-Key`

**Request:**

```http
POST /api/generate
Content-Type: application/json
X-Session-Key: a1b2c3d4e5f6...

{
  "preset": "3+3",
  "minWidthCols": 2
}
```

**Parametry:**

| Parametr | Typ | Domyślnie | Opis |
|----------|-----|-----------|------|
| `preset` | string | wymagany | Nazwa presetu layoutu |
| `minWidthCols` | number | 1 | Minimalna szerokość widgetów (1-3) |

**Wartości minWidthCols:**

- `1` - brak ograniczenia (min 1 kolumna)
- `2` - minimum połowa szerokości (6 kolumn)
- `3` - minimum 1/3 szerokości (4 kolumny)

**Response:**

```json
{
  "success": true,
  "dashboard": {
    "name": "Generated Dashboard",
    "theme": "teal",
    "metadata": {
      "generatedAt": "2024-01-15T10:30:00.000Z",
      "preset": "3+3"
    },
    "gridLayout": [
      { "i": "widget-1", "x": 0, "y": 0, "w": 4, "h": 4 },
      { "i": "widget-2", "x": 4, "y": 0, "w": 4, "h": 4 },
      ...
    ],
    "widgets": [
      {
        "id": "widget-1",
        "type": "SimpleKPI",
        "props": {
          "title": "Active Users",
          "value": "1,234",
          "trend": "up",
          "skeleton": "semi"
        }
      },
      ...
    ]
  },
  "session_key": "a1b2c3d4e5f6..."
}
```

## Generowanie z bin-packing

### POST `/api/generate/packed`

Generuje dashboard używając algorytmu bin-packing do optymalnego rozmieszczenia.

**Wymaga:** `X-Session-Key`

**Request:**

```http
POST /api/generate/packed
Content-Type: application/json
X-Session-Key: a1b2c3d4e5f6...

{
  "widgetCount": 8
}
```

**Parametry:**

| Parametr | Typ | Domyślnie | Opis |
|----------|-----|-----------|------|
| `widgetCount` | number | wymagany | Liczba widgetów (1-20) |

**Response:**

```json
{
  "success": true,
  "dashboard": {
    "name": "Generated Dashboard",
    "theme": "teal",
    "metadata": {
      "generatedAt": "2024-01-15T10:30:00.000Z",
      "algorithm": "bin-packing"
    },
    "gridLayout": [...],
    "widgets": [...]
  },
  "session_key": "a1b2c3d4e5f6..."
}
```

## Algorytm generowania

### 1. Wybór widgetów

System losowo wybiera widgety z puli dostępnych typów, uwzględniając:

- Konfigurację `availableInRandom` per widget
- Minimalną szerokość (`minColumns`) widgetu
- Ograniczenie `minWidthCols` z requestu

### 2. Rozmieszczenie

**Preset-based:**
- Widgety umieszczane w predefiniowanych pozycjach
- Szerokość wynika z definicji presetu

**Bin-packing:**
- Algorytm optymalnie wypełnia dostępną przestrzeń
- Minimalizuje puste miejsca
- Zachowuje minimalną szerokość widgetów

### 3. Dane widgetów

Każdy widget otrzymuje losowe przykładowe dane:
- KPI: wartości, trendy
- Wykresy: dane punktów
- Listy: przykładowe elementy
- Tabele: przykładowe wiersze

### 4. Skeleton mode

Tryb skeleton jest pobierany z konfiguracji widgetów sesji lub domyślnej.

## Przykład użycia

```javascript
// Generuj z presetu
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-Key': sessionKey
  },
  body: JSON.stringify({
    preset: '3+3',
    minWidthCols: 2
  })
});

const { dashboard } = await response.json();

// Generuj z bin-packing
const packedResponse = await fetch('/api/generate/packed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-Key': sessionKey
  },
  body: JSON.stringify({
    widgetCount: 10
  })
});
```
