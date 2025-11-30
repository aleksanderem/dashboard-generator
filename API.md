# Dashboard Generator API Documentation

Base URL: `https://dashboards.tytan.kolabogroup.pl`

## Authentication

API uses email-based sessions. First call with an email creates a session, subsequent calls reuse the same session key.

---

## Endpoints

### POST /api/generate-and-save

Generate a random dashboard, save it to database, and automatically export PNG.

#### Request

```bash
curl -X POST "https://dashboards.tytan.kolabogroup.pl/api/generate-and-save" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "user@example.com",
      "preset": "3+3",
      "name": "My Dashboard",
      "themeName": "Security",
      "badgeText": "Security",
      "badgeColor": "#FFCC24",
      "skeletonMode": true,
      "appName": "Security Center",
      "appCategory": "security"
    }'
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | User email for session management |
| `preset` | string | Yes | Layout preset: `"2+2"`, `"3+3"`, `"4+4"`, `"2+2+2"`, `"3+3+3"`, `"1+2"`, `"2+1"`, `"1+2+1"` |
| `name` | string | No | Dashboard name (default: auto-generated) |
| `theme` or `themeName` | string | No | Theme name: `"teal"`, `"Security"`, `"ITSM"`, `"Monitoring"`, `"AD"`, `"UEM"` |
| `badgeText` | string | No | Custom badge text (overrides category) |
| `badgeColor` | string | No | Custom badge color (hex, e.g. `"#FFCC24"`) |
| `skeletonMode` | boolean | No | Enable skeleton mode (hides titles, shows placeholders) |
| `skeletonTitlesOnly` | boolean | No | Show only title skeletons |
| `appName` | string | No | Application name shown in navbar |
| `appCategory` | string | No | Category: `"security"`, `"itsm"`, `"monitoring"`, `"ad"`, `"uem"`, `"custom"` |

#### Response

```json
{
  "success": true,
  "dashboardId": 34,
  "sessionKey": "f1fcf32aac6e3e6423b8748a9f0edabe...",
  "email": "user@example.com",
  "renderUrl": "https://dashboards.tytan.kolabogroup.pl/api/dashboards/34/render.png",
  "thumbnailUrl": "https://dashboards.tytan.kolabogroup.pl/api/dashboards/34/thumbnail.png",
  "previewUrl": "https://dashboards.tytan.kolabogroup.pl/?id=34&render=true",
  "apiUrl": "https://dashboards.tytan.kolabogroup.pl/api/dashboards/34",
  "pngExport": {
    "filename": "dashboard-34-1764521293183.png",
    "filePath": "https://dashboards.tytan.kolabogroup.pl/api/dashboards/34/export/dashboard-34-1764521293183.png",
    "fileSize": 178126
  },
  "dashboard": {
    "name": "My Dashboard",
    "theme": "Security",
    "widgetCount": 6,
    "preset": "3+3"
  }
}
```

---

### GET /api/dashboards/:id

Get dashboard data by ID.

#### Request

```bash
curl "https://dashboards.tytan.kolabogroup.pl/api/dashboards/34"
```

#### Response

```json
{
  "success": true,
  "dashboard": {
    "_id": 34,
    "name": "My Dashboard",
    "dashboard": {
      "name": "...",
      "theme": "teal",
      "metadata": {
        "widgetCount": 6,
        "skeletonMode": true,
        "badgeText": "Security",
        "badgeColor": "#FFCC24"
      },
      "gridLayout": [...],
      "widgets": [...]
    },
    "theme": "{...}",
    "appName": "Security Center",
    "appCategory": "security"
  }
}
```

---

### GET /api/dashboards/:id/export/:filename

Get exported PNG file.

#### Request

```bash
curl -o dashboard.png "https://dashboards.tytan.kolabogroup.pl/api/dashboards/34/export/dashboard-34-1764521293183.png"
```

---

### POST /api/dashboards/:id/export-png

Upload PNG export from frontend (used internally by auto-export).

#### Request

```bash
curl -X POST "https://dashboards.tytan.kolabogroup.pl/api/dashboards/34/export-png" \
    -H "Content-Type: application/json" \
    -d '{
      "imageData": "data:image/png;base64,..."
    }'
```

#### Response

```json
{
  "success": true,
  "filename": "dashboard-34-1764521293183.png",
  "filePath": "/api/dashboards/34/export/dashboard-34-1764521293183.png",
  "fileSize": 178126
}
```

---

### GET /api/dashboards

List all dashboards.

#### Request

```bash
curl "https://dashboards.tytan.kolabogroup.pl/api/dashboards"
```

---

### DELETE /api/dashboards/:id

Delete a dashboard.

#### Request

```bash
curl -X DELETE "https://dashboards.tytan.kolabogroup.pl/api/dashboards/34"
```

---

## Layout Presets

| Preset | Description | Widgets |
|--------|-------------|---------|
| `2+2` | 2 rows, 2 columns | 4 |
| `3+3` | 2 rows, 3 columns | 6 |
| `4+4` | 2 rows, 4 columns | 8 |
| `2+2+2` | 3 rows, 2 columns | 6 |
| `3+3+3` | 3 rows, 3 columns | 9 |
| `1+2` | 1 top, 2 bottom | 3 |
| `2+1` | 2 top, 1 bottom | 3 |
| `1+2+1` | 1 top, 2 middle, 1 bottom | 4 |

---

## Themes

| Theme Name | Primary Color | Description |
|------------|---------------|-------------|
| `teal` | #14B8A6 | Default teal theme |
| `Security` | #FFCC24 | Yellow security theme |
| `ITSM` | #9333EA | Purple ITSM theme |
| `Monitoring` | #0078B5 | Blue monitoring theme |
| `AD` | #C92133 | Red Active Directory theme |
| `UEM` | #00994F | Green UEM theme |

---

## Examples

### Generate Security Dashboard with Skeleton Mode

```bash
curl -X POST "https://dashboards.tytan.kolabogroup.pl/api/generate-and-save" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "aleksander@kolaboit.pl",
      "preset": "3+3",
      "name": "Security Dashboard Q4",
      "themeName": "Security",
      "badgeText": "Security",
      "badgeColor": "#FFCC24",
      "skeletonMode": true,
      "appName": "Security Center",
      "appCategory": "security"
    }'
```

### Generate ITSM Dashboard

```bash
curl -X POST "https://dashboards.tytan.kolabogroup.pl/api/generate-and-save" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "user@example.com",
      "preset": "4+4",
      "name": "ITSM Overview",
      "themeName": "ITSM",
      "badgeText": "ITSM",
      "appName": "Service Desk",
      "appCategory": "itsm"
    }'
```

---

## Changelog

### 2025-11-30

- Added `POST /api/generate-and-save` endpoint
- Automatic PNG export using html-to-image (same as UI Export PNG button)
- Fixed skeleton mode not being applied from API
- Fixed layout bug in render mode (sidebar + content flex layout)
- Added `autoExport` URL parameter for automatic PNG generation
