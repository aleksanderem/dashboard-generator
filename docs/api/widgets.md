# Konfiguracja widgetów API

Endpointy do zarządzania konfiguracją widgetów per sesja.

## Pobierz konfigurację

### GET `/api/widgets/config`

Pobiera konfigurację widgetów dla aktualnej sesji lub domyślną.

**Request:**

```http
GET /api/widgets/config
X-Session-Key: a1b2c3d4e5f6... (opcjonalnie)
```

**Response (z sesją):**

```json
{
  "success": true,
  "config": {
    "SimpleKPI": {
      "skeletonMode": "semi",
      "minColumns": 2,
      "availableInRandom": true
    },
    "SimpleTable": {
      "skeletonMode": "full",
      "minColumns": 6,
      "availableInRandom": true
    }
  },
  "sessionBound": true
}
```

**Response (bez sesji - domyślna):**

```json
{
  "success": true,
  "config": {
    "SimpleKPI": {
      "skeletonMode": "semi",
      "minColumns": 2,
      "availableInRandom": true
    }
  },
  "sessionBound": false
}
```

## Zapisz konfigurację

### PUT `/api/widgets/config`

Zapisuje konfigurację widgetów dla sesji.

**Wymaga:** `X-Session-Key`

**Request:**

```http
PUT /api/widgets/config
Content-Type: application/json
X-Session-Key: a1b2c3d4e5f6...

{
  "config": {
    "SimpleKPI": {
      "skeletonMode": "title",
      "minColumns": 3,
      "availableInRandom": true
    },
    "SimpleTable": {
      "skeletonMode": "full",
      "minColumns": 6,
      "availableInRandom": false
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Widget configuration saved",
  "session_key": "a1b2c3d4e5f6..."
}
```

## Struktura konfiguracji

### Widget Config

```typescript
interface WidgetConfig {
  skeletonMode: 'none' | 'title' | 'semi' | 'full';
  minColumns: number;  // 1-12
  availableInRandom: boolean;
}
```

### Parametry

| Parametr | Typ | Domyślnie | Opis |
|----------|-----|-----------|------|
| `skeletonMode` | string | `"semi"` | Tryb wyświetlania skeleton |
| `minColumns` | number | zależy od typu | Minimalna szerokość w kolumnach (1-12) |
| `availableInRandom` | boolean | `true` | Uwzględniaj w losowym generowaniu |

### Tryby skeleton

| Wartość | Opis |
|---------|------|
| `none` | Brak skeleton - normalne dane |
| `title` | Skeleton tylko na tytule widgetu |
| `semi` | Skeleton na tytule i podtytule, dane widoczne |
| `full` | Pełny skeleton - wszystko jako placeholder |

## Domyślna konfiguracja

Każdy typ widgetu ma domyślną konfigurację:

```javascript
{
  // Metryki
  'SimpleKPI': { skeletonMode: 'semi', minColumns: 2, availableInRandom: true },
  'SimpleMetricCard': { skeletonMode: 'semi', minColumns: 3, availableInRandom: true },
  'SimpleScoreCard': { skeletonMode: 'semi', minColumns: 3, availableInRandom: true },
  'SimpleStatusCard': { skeletonMode: 'semi', minColumns: 4, availableInRandom: true },
  'SimpleComparisonCard': { skeletonMode: 'semi', minColumns: 4, availableInRandom: true },
  'SimpleProgressBar': { skeletonMode: 'semi', minColumns: 3, availableInRandom: true },

  // Wykresy
  'SimpleAreaChart': { skeletonMode: 'semi', minColumns: 6, availableInRandom: true },
  'SimpleBarChart': { skeletonMode: 'semi', minColumns: 6, availableInRandom: true },
  'SimpleLineChart': { skeletonMode: 'semi', minColumns: 6, availableInRandom: true },
  'SimplePieChart': { skeletonMode: 'semi', minColumns: 4, availableInRandom: true },
  'SimpleGaugeChart': { skeletonMode: 'semi', minColumns: 4, availableInRandom: true },
  'SimpleHeatmap': { skeletonMode: 'full', minColumns: 6, availableInRandom: true },

  // Listy
  'SimpleTable': { skeletonMode: 'semi', minColumns: 6, availableInRandom: true },
  'SimpleAgentList': { skeletonMode: 'full', minColumns: 4, availableInRandom: true },
  'SimpleBadgeList': { skeletonMode: 'semi', minColumns: 3, availableInRandom: true },
  'SimplePriorityList': { skeletonMode: 'semi', minColumns: 4, availableInRandom: true },
  'SimpleRecentList': { skeletonMode: 'full', minColumns: 4, availableInRandom: true },
  'SimpleStatusList': { skeletonMode: 'semi', minColumns: 4, availableInRandom: true },
  'SimpleTimelineCard': { skeletonMode: 'full', minColumns: 4, availableInRandom: false },
  'SimpleCategoryCards': { skeletonMode: 'semi', minColumns: 6, availableInRandom: true }
}
```

## Wpływ na generowanie

Konfiguracja wpływa na `POST /api/generate` i `POST /api/generate/packed`:

1. **availableInRandom: false** - widget nie będzie wybierany
2. **minColumns** - minimalna szerokość przy rozmieszczaniu
3. **skeletonMode** - ustawiany w `props.skeleton` wygenerowanego widgetu

## Przykład użycia

```javascript
// Pobierz aktualną konfigurację
const configResponse = await fetch('/api/widgets/config', {
  headers: { 'X-Session-Key': sessionKey }
});
const { config } = await configResponse.json();

// Zmodyfikuj konfigurację
config.SimpleTable.availableInRandom = false;
config.SimpleKPI.skeletonMode = 'title';

// Zapisz zmiany
await fetch('/api/widgets/config', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-Key': sessionKey
  },
  body: JSON.stringify({ config })
});
```

## Minimalny rozmiar (minColumns)

Wartość `minColumns` określa minimalną szerokość widgetu w siatce 12-kolumnowej:

| minColumns | Szerokość | Procent |
|------------|-----------|---------|
| 2 | 2/12 | 16.67% |
| 3 | 3/12 | 25% |
| 4 | 4/12 | 33.33% |
| 6 | 6/12 | 50% |
| 12 | 12/12 | 100% |

Podczas generowania, system respektuje zarówno `minColumns` widgetu, jak i parametr `minWidthCols` z requestu.
