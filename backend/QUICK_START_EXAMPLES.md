# Dashboard Rendering API - Quick Start Examples

This guide provides ready-to-run examples for using the dashboard rendering endpoints.

## Prerequisites

1. Server is running on port 3001:
   ```bash
   cd backend
   npm start
   ```

2. For screenshot endpoint, ensure you have a valid `ANTHROPIC_API_KEY` in `.env`

---

## Example 1: Simple KPI Dashboard

### cURL Request

```bash
curl -X POST http://localhost:3001/api/render-dashboard \
  -H "Content-Type: application/json" \
  -d '{
    "widgets": [
      {
        "id": "total-users",
        "component": "SimpleKPI",
        "props": {
          "title": "Total Users",
          "value": "2,847",
          "subtitle": "+12% from last month"
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
      },
      {
        "id": "orders",
        "component": "SimpleScoreCard",
        "props": {
          "title": "Total Orders",
          "value": "1,234",
          "subtitle": "89% fulfillment rate"
        }
      }
    ],
    "gridLayout": [
      {"i": "total-users", "x": 0, "y": 0, "w": 4, "h": 4},
      {"i": "revenue", "x": 4, "y": 0, "w": 4, "h": 4},
      {"i": "orders", "x": 8, "y": 0, "w": 4, "h": 4}
    ],
    "theme": "teal",
    "appName": "Sales Dashboard",
    "appCategory": "analytics"
  }' \
  --output simple-kpi-dashboard.png

echo "✅ Dashboard saved to simple-kpi-dashboard.png"
```

### JavaScript (Node.js)

```javascript
const fs = require('fs');

async function renderSimpleDashboard() {
  const response = await fetch('http://localhost:3001/api/render-dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      widgets: [
        {
          id: 'total-users',
          component: 'SimpleKPI',
          props: {
            title: 'Total Users',
            value: '2,847',
            subtitle: '+12% from last month'
          }
        },
        {
          id: 'revenue',
          component: 'SimpleMetricCard',
          props: {
            title: 'Monthly Revenue',
            value: '$45,230',
            subtitle: '+23% increase'
          }
        }
      ],
      gridLayout: [
        { i: 'total-users', x: 0, y: 0, w: 6, h: 4 },
        { i: 'revenue', x: 6, y: 0, w: 6, h: 4 }
      ],
      theme: 'teal',
      appName: 'Sales Dashboard'
    })
  });

  const buffer = await response.arrayBuffer();
  fs.writeFileSync('simple-dashboard.png', Buffer.from(buffer));
  console.log('✅ Dashboard saved!');
}

renderSimpleDashboard();
```

---

## Example 2: Charts Dashboard

### cURL Request

```bash
curl -X POST http://localhost:3001/api/render-dashboard \
  -H "Content-Type: application/json" \
  -d '{
    "widgets": [
      {
        "id": "sales-bar",
        "component": "SimpleBarChart",
        "props": {
          "title": "Monthly Sales",
          "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          "data": [65, 59, 80, 81, 56, 55]
        }
      },
      {
        "id": "traffic-line",
        "component": "SimpleLineChart",
        "props": {
          "title": "Website Traffic",
          "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          "data": [30, 45, 38, 50, 49, 60, 70]
        }
      },
      {
        "id": "categories-pie",
        "component": "SimplePieChart",
        "props": {
          "title": "Sales by Category",
          "labels": ["Electronics", "Clothing", "Food", "Books"],
          "data": [35, 25, 25, 15]
        }
      }
    ],
    "gridLayout": [
      {"i": "sales-bar", "x": 0, "y": 0, "w": 12, "h": 8},
      {"i": "traffic-line", "x": 0, "y": 8, "w": 6, "h": 8},
      {"i": "categories-pie", "x": 6, "y": 8, "w": 6, "h": 8}
    ],
    "theme": "monitoring",
    "appName": "Analytics Dashboard",
    "appCategory": "monitoring"
  }' \
  --output charts-dashboard.png

echo "✅ Charts dashboard saved to charts-dashboard.png"
```

---

## Example 3: Mixed Dashboard with Lists

### cURL Request

```bash
curl -X POST http://localhost:3001/api/render-dashboard \
  -H "Content-Type: application/json" \
  -d '{
    "widgets": [
      {
        "id": "active-users",
        "component": "SimpleKPI",
        "props": {
          "title": "Active Users",
          "value": "1,234"
        }
      },
      {
        "id": "recent-activities",
        "component": "SimpleStatusList",
        "props": {
          "title": "Recent Activities",
          "items": [
            "User john@example.com registered",
            "Payment processed: $299.00",
            "New order #12345 created",
            "System backup completed",
            "Database optimized"
          ]
        }
      },
      {
        "id": "priority-tasks",
        "component": "SimplePriorityList",
        "props": {
          "title": "High Priority Tasks",
          "items": [
            "Fix critical bug in checkout",
            "Review security audit",
            "Update SSL certificates",
            "Deploy v2.0.1 hotfix"
          ]
        }
      }
    ],
    "gridLayout": [
      {"i": "active-users", "x": 0, "y": 0, "w": 12, "h": 4},
      {"i": "recent-activities", "x": 0, "y": 4, "w": 6, "h": 10},
      {"i": "priority-tasks", "x": 6, "y": 4, "w": 6, "h": 10}
    ],
    "theme": "itsm",
    "appName": "Operations Dashboard",
    "appCategory": "itsm"
  }' \
  --output mixed-dashboard.png

echo "✅ Mixed dashboard saved to mixed-dashboard.png"
```

---

## Example 4: Custom Dimensions (4K)

### cURL Request

```bash
curl -X POST http://localhost:3001/api/render-dashboard \
  -H "Content-Type: application/json" \
  -d '{
    "widgets": [
      {
        "id": "metric-1",
        "component": "SimpleKPI",
        "props": {
          "title": "Total Revenue",
          "value": "$125,430",
          "subtitle": "+15%"
        }
      }
    ],
    "gridLayout": [
      {"i": "metric-1", "x": 0, "y": 0, "w": 6, "h": 4}
    ],
    "theme": "teal",
    "appName": "4K Dashboard",
    "width": 3840,
    "height": 2160
  }' \
  --output dashboard-4k.png

echo "✅ 4K dashboard saved to dashboard-4k.png"
```

---

## Example 5: Screenshot to Dashboard

### cURL Request

```bash
# Upload a dashboard screenshot
curl -X POST http://localhost:3001/api/screenshot-to-dashboard \
  -F "screenshot=@path/to/dashboard-screenshot.png" \
  --output analyzed-dashboard.png

echo "✅ Analyzed dashboard saved to analyzed-dashboard.png"
```

### With Custom Parameters

```bash
curl -X POST "http://localhost:3001/api/screenshot-to-dashboard?width=1280&height=720&appName=My Dashboard" \
  -F "screenshot=@path/to/screenshot.png" \
  --output analyzed-dashboard-720p.png

echo "✅ 720p dashboard saved to analyzed-dashboard-720p.png"
```

---

## Example 6: All Themes Comparison

### Bash Script

```bash
#!/bin/bash

# Dashboard data
DATA='{
  "widgets": [
    {
      "id": "metric",
      "component": "SimpleKPI",
      "props": {
        "title": "Revenue",
        "value": "$45,230"
      }
    }
  ],
  "gridLayout": [
    {"i": "metric", "x": 0, "y": 0, "w": 6, "h": 4}
  ],
  "appName": "Theme Demo"
}'

# Render each theme
for theme in teal itsm security monitoring ad uem custom; do
  echo "Rendering $theme theme..."

  curl -X POST http://localhost:3001/api/render-dashboard \
    -H "Content-Type: application/json" \
    -d "$(echo "$DATA" | jq --arg t "$theme" '. + {theme: $t, appCategory: $t}')" \
    --output "theme-$theme.png"

  echo "✅ $theme theme saved to theme-$theme.png"
done

echo ""
echo "✅ All themes rendered!"
ls -lh theme-*.png
```

---

## Example 7: Progress Bar Dashboard

### cURL Request

```bash
curl -X POST http://localhost:3001/api/render-dashboard \
  -H "Content-Type: application/json" \
  -d '{
    "widgets": [
      {
        "id": "project-progress",
        "component": "SimpleProgressBar",
        "props": {
          "title": "Project Completion",
          "progress": 75
        }
      },
      {
        "id": "budget-progress",
        "component": "SimpleProgressBar",
        "props": {
          "title": "Budget Used",
          "progress": 45
        }
      },
      {
        "id": "timeline-progress",
        "component": "SimpleProgressBar",
        "props": {
          "title": "Timeline",
          "progress": 60
        }
      }
    ],
    "gridLayout": [
      {"i": "project-progress", "x": 0, "y": 0, "w": 12, "h": 4},
      {"i": "budget-progress", "x": 0, "y": 4, "w": 12, "h": 4},
      {"i": "timeline-progress", "x": 0, "y": 8, "w": 12, "h": 4}
    ],
    "theme": "security",
    "appName": "Project Dashboard"
  }' \
  --output progress-dashboard.png

echo "✅ Progress dashboard saved to progress-dashboard.png"
```

---

## Example 8: Table Dashboard

### cURL Request

```bash
curl -X POST http://localhost:3001/api/render-dashboard \
  -H "Content-Type: application/json" \
  -d '{
    "widgets": [
      {
        "id": "users-table",
        "component": "SimpleTable",
        "props": {
          "title": "Top Users",
          "headers": ["Name", "Email", "Revenue", "Status"],
          "rows": [
            ["John Doe", "john@example.com", "$1,234", "Active"],
            ["Jane Smith", "jane@example.com", "$2,345", "Active"],
            ["Bob Johnson", "bob@example.com", "$987", "Pending"],
            ["Alice Brown", "alice@example.com", "$3,456", "Active"]
          ]
        }
      }
    ],
    "gridLayout": [
      {"i": "users-table", "x": 0, "y": 0, "w": 12, "h": 12}
    ],
    "theme": "uem",
    "appName": "Users Dashboard"
  }' \
  --output table-dashboard.png

echo "✅ Table dashboard saved to table-dashboard.png"
```

---

## Example 9: Complex Multi-Widget Dashboard

### JavaScript (Node.js)

Save as `render-complex-dashboard.js`:

```javascript
const fs = require('fs');

const dashboardData = {
  widgets: [
    // Top row - KPIs
    {
      id: 'kpi-1',
      component: 'SimpleKPI',
      props: { title: 'Total Users', value: '2,847', subtitle: '+12%' }
    },
    {
      id: 'kpi-2',
      component: 'SimpleMetricCard',
      props: { title: 'Revenue', value: '$45,230', subtitle: '+23%' }
    },
    {
      id: 'kpi-3',
      component: 'SimpleScoreCard',
      props: { title: 'Orders', value: '1,234', subtitle: '89% rate' }
    },
    // Charts row
    {
      id: 'chart-1',
      component: 'SimpleBarChart',
      props: {
        title: 'Monthly Sales',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [65, 59, 80, 81, 56, 55]
      }
    },
    {
      id: 'chart-2',
      component: 'SimpleLineChart',
      props: {
        title: 'Traffic',
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        data: [30, 45, 38, 50, 49]
      }
    },
    // Lists row
    {
      id: 'list-1',
      component: 'SimpleStatusList',
      props: {
        title: 'Recent Activities',
        items: ['User registered', 'Payment processed', 'Order created']
      }
    }
  ],
  gridLayout: [
    { i: 'kpi-1', x: 0, y: 0, w: 4, h: 4 },
    { i: 'kpi-2', x: 4, y: 0, w: 4, h: 4 },
    { i: 'kpi-3', x: 8, y: 0, w: 4, h: 4 },
    { i: 'chart-1', x: 0, y: 4, w: 6, h: 8 },
    { i: 'chart-2', x: 6, y: 4, w: 6, h: 8 },
    { i: 'list-1', x: 0, y: 12, w: 12, h: 8 }
  ],
  theme: 'teal',
  appName: 'Complete Dashboard',
  appCategory: 'analytics',
  width: 1920,
  height: 1080
};

async function renderComplexDashboard() {
  console.log('🎨 Rendering complex dashboard...');

  const response = await fetch('http://localhost:3001/api/render-dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dashboardData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync('complex-dashboard.png', Buffer.from(buffer));

  console.log('✅ Complex dashboard saved to complex-dashboard.png');
}

renderComplexDashboard().catch(console.error);
```

Run:
```bash
node render-complex-dashboard.js
```

---

## Example 10: Batch Rendering

### Bash Script

```bash
#!/bin/bash

# Array of dashboard configurations
declare -a dashboards=(
  "teal:Sales Dashboard:analytics"
  "itsm:IT Dashboard:itsm"
  "security:Security Dashboard:security"
  "monitoring:Monitoring Dashboard:monitoring"
)

echo "🚀 Batch rendering dashboards..."

for config in "${dashboards[@]}"; do
  IFS=':' read -r theme name category <<< "$config"

  echo "Rendering: $name ($theme theme)..."

  curl -s -X POST http://localhost:3001/api/render-dashboard \
    -H "Content-Type: application/json" \
    -d "{
      \"widgets\": [
        {
          \"id\": \"metric\",
          \"component\": \"SimpleKPI\",
          \"props\": {
            \"title\": \"Sample Metric\",
            \"value\": \"1,234\"
          }
        }
      ],
      \"gridLayout\": [
        {\"i\": \"metric\", \"x\": 0, \"y\": 0, \"w\": 6, \"h\": 4}
      ],
      \"theme\": \"$theme\",
      \"appName\": \"$name\",
      \"appCategory\": \"$category\"
    }" \
    --output "batch-$theme.png"

  echo "✅ $name saved"
done

echo ""
echo "✅ Batch rendering complete!"
ls -lh batch-*.png
```

---

## Testing the API

### Quick Health Check

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Dashboard AI Generator API is running"
}
```

### Test All Endpoints

```bash
# Run the test suite
cd backend
node test-endpoints.js
```

---

## Error Handling Examples

### Invalid Request (Missing widgets)

```bash
curl -X POST http://localhost:3001/api/render-dashboard \
  -H "Content-Type: application/json" \
  -d '{
    "gridLayout": []
  }'
```

Response:
```json
{
  "success": false,
  "error": "Missing required field: widgets (must be an array)"
}
```

### Invalid Request (Missing gridLayout)

```bash
curl -X POST http://localhost:3001/api/render-dashboard \
  -H "Content-Type: application/json" \
  -d '{
    "widgets": []
  }'
```

Response:
```json
{
  "success": false,
  "error": "Missing required field: gridLayout (must be an array)"
}
```

---

## Tips and Best Practices

1. **Widget IDs:** Ensure widget IDs match between `widgets` and `gridLayout` arrays

2. **Grid Layout:** Use a 12-column grid system (x: 0-11, y: 0+)

3. **Themes:** Choose appropriate themes for your use case:
   - `teal` - General purpose
   - `itsm` - IT dashboards
   - `security` - Security monitoring
   - `monitoring` - System monitoring
   - `ad` - Active Directory
   - `uem` - Device management

4. **Dimensions:** Common resolutions:
   - 1920x1080 (Full HD) - Default
   - 1280x720 (HD)
   - 3840x2160 (4K)
   - 2560x1440 (2K)

5. **Performance:** Rendering takes 1-3 seconds per dashboard

6. **File Size:** Typical PNG output is 50-100 KB

---

## Need Help?

- **API Documentation:** See `RENDERING_API_DOCS.md`
- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`
- **Run Tests:** `node test-render.js` or `node test-endpoints.js`

---

**Happy Rendering! 🎨**
