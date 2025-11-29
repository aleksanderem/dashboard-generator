# Renderowanie i analiza

Endpointy do analizy zrzutów ekranu i renderowania dashboardów do PNG.

## Analiza zrzutu ekranu

### POST `/api/analyze`

Analizuje zrzut ekranu dashboardu używając Claude Vision API.

**Request:**

```http
POST /api/analyze?save=true&name=My%20Dashboard
Content-Type: multipart/form-data

screenshot: <plik obrazu>
```

**Query Parameters:**

| Parametr | Typ | Domyślnie | Opis |
|----------|-----|-----------|------|
| `save` | boolean | `false` | Zapisz dashboard po analizie |
| `name` | string | - | Nazwa dla zapisanego dashboardu |
| `appName` | string | - | Nazwa aplikacji |
| `appCategory` | string | - | Kategoria aplikacji |

**Ograniczenia:**
- Maksymalny rozmiar: 10MB
- Akceptowane formaty: `image/*`

**Response:**

```json
{
  "success": true,
  "dashboard": {
    "layout": {
      "columns": 3,
      "rows": 2,
      "structure": "3+3"
    },
    "theme": {
      "primaryColor": "#14b8a6",
      "name": "teal"
    },
    "widgets": [
      {
        "type": "kpi_card",
        "title": "Total Users",
        "position": { "row": 0, "col": 0 },
        "size": { "width": 1, "height": 1 },
        "data": { "value": "1,234", "trend": "up" }
      }
    ],
    "gridLayout": [
      { "i": "widget-1", "x": 0, "y": 0, "w": 4, "h": 4 }
    ],
    "metadata": {
      "appName": "Analytics",
      "appCategory": "monitoring"
    },
    "analysis": {
      "confidence": 85,
      "quality": "good",
      "issues": [],
      "canRender": true
    }
  },
  "savedDashboard": {
    "id": 5,
    "name": "My Dashboard"
  }
}
```

### Analiza jakości

| Wartość `quality` | Confidence | Opis |
|-------------------|------------|------|
| `excellent` | 90-100 | Doskonała jakość, pełne rozpoznanie |
| `good` | 70-89 | Dobra jakość, większość widgetów rozpoznana |
| `fair` | 50-69 | Średnia jakość, niektóre elementy niejasne |
| `poor` | 0-49 | Słaba jakość, wiele problemów |

### Możliwe issues

```json
{
  "issues": [
    "Low resolution image",
    "Partially obscured widgets",
    "Unknown widget types detected",
    "Complex nested layouts"
  ]
}
```

## Renderowanie dashboardu

### POST `/api/render-dashboard`

Renderuje dane dashboardu do obrazu PNG.

**Request:**

```http
POST /api/render-dashboard
Content-Type: application/json

{
  "widgets": [...],
  "gridLayout": [...],
  "theme": "blue",
  "appName": "Security Center",
  "appCategory": "security",
  "width": 1200,
  "height": 800
}
```

**Parametry:**

| Parametr | Typ | Domyślnie | Opis |
|----------|-----|-----------|------|
| `widgets` | array | wymagany | Lista widgetów |
| `gridLayout` | array | wymagany | Pozycje widgetów |
| `theme` | string | `"teal"` | Motyw kolorystyczny |
| `appName` | string | - | Nazwa aplikacji (header) |
| `appCategory` | string | - | Kategoria aplikacji |
| `width` | number | `1200` | Szerokość obrazu (px) |
| `height` | number | `800` | Wysokość obrazu (px) |

**Response:**

```http
Content-Type: image/png

<binary PNG data>
```

## Screenshot to Dashboard (All-in-one)

### POST `/api/screenshot-to-dashboard`

Analizuje zrzut ekranu i zwraca wyrenderowany PNG w jednym kroku.

**Request:**

```http
POST /api/screenshot-to-dashboard?width=1200&height=800
Content-Type: multipart/form-data

screenshot: <plik obrazu>
```

**Query/Body Parameters:**

| Parametr | Typ | Domyślnie | Opis |
|----------|-----|-----------|------|
| `width` | number | `1200` | Szerokość wyjściowego PNG |
| `height` | number | `800` | Wysokość wyjściowego PNG |
| `appName` | string | - | Nazwa aplikacji |
| `appCategory` | string | - | Kategoria aplikacji |

**Response:**

```http
Content-Type: image/png

<binary PNG data>
```

## Przykłady użycia

### Analiza z zapisem

```javascript
const formData = new FormData();
formData.append('screenshot', file);

const response = await fetch('/api/analyze?save=true&name=My%20Dashboard', {
  method: 'POST',
  body: formData
});

const { dashboard, savedDashboard } = await response.json();
console.log(`Saved with ID: ${savedDashboard.id}`);
```

### Renderowanie do PNG

```javascript
const response = await fetch('/api/render-dashboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    widgets: dashboard.widgets,
    gridLayout: dashboard.gridLayout,
    theme: 'blue',
    width: 1920,
    height: 1080
  })
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);

// Pobierz plik
const a = document.createElement('a');
a.href = url;
a.download = 'dashboard.png';
a.click();
```

### Quick convert (screenshot → PNG)

```javascript
const formData = new FormData();
formData.append('screenshot', file);

const response = await fetch('/api/screenshot-to-dashboard?width=1200&height=800', {
  method: 'POST',
  body: formData
});

const blob = await response.blob();
// Użyj jako obraz
```

## Mapowanie widgetów

Podczas analizy, Claude wykrywa typy widgetów, które są mapowane na uproszczone komponenty:

| Wykryty typ | Komponent |
|-------------|-----------|
| `kpi`, `kpi_card` | SimpleKPI |
| `metric`, `metric_card` | SimpleMetricCard |
| `line_chart` | SimpleLineChart |
| `area_chart` | SimpleAreaChart |
| `bar_chart` | SimpleBarChart |
| `pie_chart`, `donut_chart` | SimplePieChart |
| `gauge`, `gauge_chart` | SimpleGaugeChart |
| `table`, `data_table` | SimpleBadgeList |
| `status_list` | SimpleStatusCard |
| `progress`, `progress_bar` | SimpleProgressBar |
| `heatmap` | SimpleHeatmap |
| `timeline` | SimpleTimelineCard |
