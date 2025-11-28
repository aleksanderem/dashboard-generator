# Dashboard Rendering API Documentation

This document describes the dashboard rendering endpoints that generate PNG images from dashboard data.

## Table of Contents

- [Overview](#overview)
- [Endpoints](#endpoints)
  - [POST /api/render-dashboard](#post-apirender-dashboard)
  - [POST /api/screenshot-to-dashboard](#post-apiscreenshot-to-dashboard)
- [Data Structures](#data-structures)
- [Theme Support](#theme-support)
- [Examples](#examples)
- [Error Handling](#error-handling)

---

## Overview

The dashboard rendering API uses **Puppeteer** to render HTML dashboards as PNG images. It supports:

- ✅ Multiple themes (teal, itsm, security, monitoring, ad, uem, custom)
- ✅ Custom dimensions (default: 1920x1080)
- ✅ All widget types (KPI cards, charts, tables, lists, etc.)
- ✅ Chart.js integration for dynamic charts
- ✅ Responsive grid layout (12-column grid system)

---

## Endpoints

### POST /api/render-dashboard

Renders a dashboard from provided JSON data and returns a PNG image.

#### Request

**URL:** `POST /api/render-dashboard`

**Content-Type:** `application/json`

**Body Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `widgets` | Array | ✅ Yes | - | Array of widget objects with component and props |
| `gridLayout` | Array | ✅ Yes | - | Array of layout objects with position (x, y, w, h) |
| `theme` | String | No | `'teal'` | Theme name (teal, itsm, security, monitoring, ad, uem, custom) |
| `appName` | String | No | `'Dashboard'` | Application name shown in navbar |
| `appCategory` | String | No | `'analytics'` | Category badge shown in navbar |
| `width` | Number | No | `1920` | Output image width in pixels |
| `height` | Number | No | `1080` | Output image height in pixels |

#### Response

**Content-Type:** `image/png`

**Headers:**
- `Content-Disposition: attachment; filename="dashboard-{timestamp}.png"`
- `Content-Length: {size}`

**Body:** Binary PNG image data

#### Example Request

```bash
curl -X POST http://localhost:3001/api/render-dashboard \
  -H "Content-Type: application/json" \
  -d '{
    "widgets": [
      {
        "id": "widget-1",
        "component": "SimpleKPI",
        "props": {
          "title": "Total Users",
          "value": "2,847",
          "subtitle": "+12%"
        }
      }
    ],
    "gridLayout": [
      {
        "i": "widget-1",
        "x": 0,
        "y": 0,
        "w": 4,
        "h": 4
      }
    ],
    "theme": "teal",
    "appName": "Analytics Dashboard",
    "appCategory": "analytics",
    "width": 1920,
    "height": 1080
  }' \
  --output dashboard.png
```

---

### POST /api/screenshot-to-dashboard

Analyzes a dashboard screenshot using Claude Vision, then renders it as a clean PNG.

#### Request

**URL:** `POST /api/screenshot-to-dashboard`

**Content-Type:** `multipart/form-data`

**Form Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `screenshot` | File | ✅ Yes | Dashboard screenshot image (PNG, JPEG, etc.) |

**Query/Body Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `width` | Number | No | `1920` | Output image width in pixels |
| `height` | Number | No | `1080` | Output image height in pixels |
| `appName` | String | No | Auto-detected | Override app name |
| `appCategory` | String | No | Auto-detected | Override category |

#### Response

**Content-Type:** `image/png`

**Headers:**
- `Content-Disposition: attachment; filename="dashboard-{timestamp}.png"`
- `Content-Length: {size}`

**Body:** Binary PNG image data

#### Example Request

```bash
curl -X POST http://localhost:3001/api/screenshot-to-dashboard \
  -F "screenshot=@/path/to/dashboard-screenshot.png" \
  --output rendered-dashboard.png
```

With custom dimensions:

```bash
curl -X POST "http://localhost:3001/api/screenshot-to-dashboard?width=1280&height=720" \
  -F "screenshot=@/path/to/dashboard-screenshot.png" \
  --output rendered-dashboard-720p.png
```

---

## Data Structures

### Widget Object

```typescript
interface Widget {
  id: string;                    // Unique widget identifier
  component: string;              // Component name (e.g., 'SimpleKPI', 'SimpleBarChart')
  props: {                        // Component-specific properties
    title?: string;
    value?: string;
    subtitle?: string;
    labels?: string[];
    data?: number[];
    items?: string[];
    // ... other component-specific props
  };
}
```

### GridLayout Object

```typescript
interface GridLayoutItem {
  i: string;                      // Widget ID (must match widget.id)
  x: number;                      // Column position (0-11 in 12-column grid)
  y: number;                      // Row position (0+)
  w: number;                      // Width in columns (1-12)
  h: number;                      // Height in rows (1+)
}
```

---

## Theme Support

Available themes with their primary colors:

| Theme | Name | Primary Color | Use Case |
|-------|------|--------------|----------|
| `teal` | Teal | #14B8A6 | Default, general purpose |
| `itsm` | ITSM | #9333EA (Purple) | IT Service Management |
| `security` | Security | #FFCC24 (Yellow) | Security dashboards |
| `monitoring` | Monitoring | #0078B5 (Blue) | System monitoring |
| `ad` | AD | #C92133 (Red) | Active Directory |
| `uem` | UEM | #00994F (Green) | Unified Endpoint Management |
| `custom` | Custom | #138D8F (Teal) | Custom dashboards |

---

## Supported Widget Components

### Metric/KPI Widgets
- `SimpleKPI` - Key performance indicator card
- `SimpleMetricCard` - Metric display card
- `SimpleScoreCard` - Score display card
- `SimpleStatusCard` - Status indicator card

### Chart Widgets
- `SimpleBarChart` - Bar/column chart
- `SimpleLineChart` - Line chart
- `SimpleAreaChart` - Area chart
- `SimplePieChart` - Pie/donut chart
- `SimpleGaugeChart` - Gauge chart

### List Widgets
- `SimpleStatusList` - Status items list
- `SimplePriorityList` - Priority items list
- `SimpleRecentList` - Recent activities list
- `SimpleBadgeList` - Badge/tag list

### Other Widgets
- `SimpleTable` - Data table
- `SimpleProgressBar` - Progress indicator
- `SimpleHeatmap` - Heatmap visualization
- `SimpleTimelineCard` - Timeline display

---

## Examples

### Example 1: Simple Dashboard with KPI Cards

```json
{
  "widgets": [
    {
      "id": "users",
      "component": "SimpleKPI",
      "props": {
        "title": "Total Users",
        "value": "2,847",
        "subtitle": "+12%"
      }
    },
    {
      "id": "revenue",
      "component": "SimpleMetricCard",
      "props": {
        "title": "Monthly Revenue",
        "value": "$45,230",
        "subtitle": "+23% increase"
      }
    }
  ],
  "gridLayout": [
    { "i": "users", "x": 0, "y": 0, "w": 6, "h": 4 },
    { "i": "revenue", "x": 6, "y": 0, "w": 6, "h": 4 }
  ],
  "theme": "teal",
  "appName": "Analytics Dashboard"
}
```

### Example 2: Dashboard with Charts

```json
{
  "widgets": [
    {
      "id": "sales-chart",
      "component": "SimpleBarChart",
      "props": {
        "title": "Monthly Sales",
        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        "data": [65, 59, 80, 81, 56, 55]
      }
    },
    {
      "id": "trend-chart",
      "component": "SimpleLineChart",
      "props": {
        "title": "Traffic Trend",
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
        "data": [30, 45, 38, 50, 49]
      }
    }
  ],
  "gridLayout": [
    { "i": "sales-chart", "x": 0, "y": 0, "w": 6, "h": 8 },
    { "i": "trend-chart", "x": 6, "y": 0, "w": 6, "h": 8 }
  ],
  "theme": "monitoring",
  "appName": "Sales Dashboard"
}
```

### Example 3: Custom Dimensions (4K)

```json
{
  "widgets": [...],
  "gridLayout": [...],
  "theme": "itsm",
  "appName": "IT Dashboard",
  "width": 3840,
  "height": 2160
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request - Missing Required Fields

```json
{
  "success": false,
  "error": "Missing required field: widgets (must be an array)"
}
```

#### 400 Bad Request - Invalid Data

```json
{
  "success": false,
  "error": "Invalid dashboard data: gridLayout is required"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to render dashboard",
  "message": "Detailed error message here"
}
```

---

## Testing

### Run Unit Tests

```bash
cd backend
node test-render.js
```

This will generate test PNG files:
- `test-output-teal.png` - Teal theme dashboard
- `test-output-itsm.png` - ITSM theme dashboard
- `test-output-custom-size.png` - Custom dimensions (1280x720)

### Test HTTP Endpoints

```bash
cd backend
# Start server in another terminal first
npm start

# Then run endpoint tests
node test-endpoints.js
```

This will test:
- POST /api/render-dashboard endpoint
- Input validation
- Error handling

---

## Performance Considerations

- **Rendering Time:** ~1-3 seconds per dashboard (depends on complexity)
- **Memory Usage:** ~200-300 MB per render (Puppeteer browser instance)
- **Concurrent Requests:** Each request spawns a new browser instance
- **File Size:** Typical PNG output is 50-100 KB

### Recommendations

- Use caching for frequently requested dashboards
- Implement request queuing for high-traffic scenarios
- Consider using persistent browser instances for better performance
- Set appropriate timeout limits (default: 30s)

---

## Dependencies

- **puppeteer** - Headless browser for rendering
- **Chart.js** - Chart rendering (loaded via CDN in HTML)
- **express** - HTTP server framework
- **multer** - File upload handling (for screenshot endpoint)

---

## Troubleshooting

### "Error: Failed to launch browser"

Make sure Puppeteer's Chromium is installed:

```bash
npm install puppeteer
```

### "Chart.js timeout - continuing anyway"

This warning is normal and can be ignored. Charts may not render if Chart.js CDN is slow or unavailable.

### "Address already in use"

Another instance is running on port 3001:

```bash
lsof -i :3001
kill -9 <PID>
```

---

## Future Enhancements

- [ ] Add support for custom fonts
- [ ] Implement dashboard caching
- [ ] Add SVG output option
- [ ] Support for dark mode themes
- [ ] Batch rendering endpoint
- [ ] WebP/JPEG output formats
- [ ] Custom CSS injection
- [ ] Dashboard templates library

---

## License

MIT License - See LICENSE file for details

## Author

Created by Aleksander Miesak
