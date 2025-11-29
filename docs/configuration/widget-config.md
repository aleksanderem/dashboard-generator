# Konfiguracja widgetów

Każdy typ widgetu może mieć indywidualną konfigurację wpływającą na jego zachowanie i wygląd.

## Parametry konfiguracji

### skeletonMode

Tryb wyświetlania skeleton loading.

| Wartość | Opis |
|---------|------|
| `'none'` | Brak skeleton - normalne dane |
| `'title'` | Skeleton tylko na tytule |
| `'semi'` | Skeleton na tytule i subtitle |
| `'full'` | Pełny skeleton |

```javascript
{ 'SimpleKPI': { skeletonMode: 'title' } }
```

### minColumns

Minimalna szerokość widgetu w siatce 12-kolumnowej.

| Wartość | Szerokość | Efekt |
|---------|-----------|-------|
| 2 | 16.67% | Bardzo kompaktowy |
| 3 | 25% | Kompaktowy (KPI) |
| 4 | 33.33% | Standardowy |
| 6 | 50% | Duży (wykresy) |
| 12 | 100% | Pełna szerokość |

```javascript
{ 'SimpleTable': { minColumns: 6 } }
```

### availableInRandom

Czy widget ma być uwzględniany przy losowym generowaniu.

```javascript
{ 'SimpleTimelineCard': { availableInRandom: false } }
```

## Domyślna konfiguracja

```javascript
const DEFAULT_WIDGET_CONFIG = {
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
};
```

## API

### Pobieranie konfiguracji

```http
GET /api/widgets/config
X-Session-Key: <optional>
```

```javascript
const response = await fetch('/api/widgets/config', {
  headers: { 'X-Session-Key': sessionKey }
});
const { config, sessionBound } = await response.json();
```

### Zapisywanie konfiguracji

```http
PUT /api/widgets/config
X-Session-Key: <required>
Content-Type: application/json

{
  "config": {
    "SimpleKPI": { "skeletonMode": "title", "minColumns": 3 },
    "SimpleTable": { "availableInRandom": false }
  }
}
```

## Interfejs użytkownika

### Widget Settings Panel

1. Otwórz menu (hamburger)
2. Kliknij "Widget Settings"
3. Dla każdego widgetu ustaw:
   - Skeleton Mode (dropdown)
   - Min Columns (slider/input)
   - Available in Random (checkbox)
4. Zmiany zapisują się automatycznie

## Wpływ na generowanie

Podczas generowania dashboardu (`POST /api/generate`):

1. System pobiera konfigurację dla sesji
2. Filtruje widgety z `availableInRandom: false`
3. Respektuje `minColumns` przy rozmieszczaniu
4. Ustawia `skeleton` w props widgetu wg `skeletonMode`

```javascript
// random-generator.js (uproszczony)
function generateRandomDashboard(preset, minWidthCols, widgetConfig) {
  const availableWidgets = Object.entries(widgetConfig)
    .filter(([type, config]) => config.availableInRandom)
    .map(([type]) => type);

  // Wybierz losowe widgety
  const selectedWidgets = selectRandom(availableWidgets, preset.totalWidgets);

  // Ustaw skeleton mode
  const widgets = selectedWidgets.map(type => ({
    type,
    props: {
      ...generateRandomData(type),
      skeleton: widgetConfig[type].skeletonMode
    }
  }));

  return { widgets, gridLayout };
}
```

## Przykłady użycia

### Wyłącz wszystkie wykresy z generatora

```javascript
const config = await getWidgetConfig();

['SimpleAreaChart', 'SimpleBarChart', 'SimpleLineChart',
 'SimplePieChart', 'SimpleGaugeChart', 'SimpleHeatmap'].forEach(type => {
  config[type].availableInRandom = false;
});

await saveWidgetConfig(config);
```

### Ustaw wszystkie widgety na skeleton='title'

```javascript
const config = await getWidgetConfig();

Object.keys(config).forEach(type => {
  config[type].skeletonMode = 'title';
});

await saveWidgetConfig(config);
```

### Zwiększ minimalną szerokość wszystkich widgetów

```javascript
const config = await getWidgetConfig();

Object.keys(config).forEach(type => {
  config[type].minColumns = Math.max(config[type].minColumns, 4);
});

await saveWidgetConfig(config);
```

## Przechowywanie

Konfiguracja jest przechowywana w tabeli `widget_configs`:

```sql
CREATE TABLE widget_configs (
  id INTEGER PRIMARY KEY,
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

Każdy rekord to jedna kombinacja sesja + typ widgetu.
