# Layout Conversion Guide: 20×30 Grid to React Grid Layout

## Overview

The layout-generator.js has been simplified to work with the new 20×30 grid system where AI provides direct x,y,w,h coordinates. The system converts from the AI's 20-column grid to React Grid Layout's 12-column grid.

## Grid Systems

### AI Analysis Grid (Input)
- **Columns**: 20 (0-19)
- **Rows**: 30 (0-29)
- **Format**: `position: { x, y, w, h }`
  - `x`: Column position (0-19)
  - `y`: Row position (0-29)
  - `w`: Width in columns (1-20)
  - `h`: Height in rows (1-30)

### React Grid Layout (Output)
- **Columns**: 12 (0-11)
- **Rows**: Unlimited
- **Format**: `{ i, x, y, w, h, minW, minH, maxW }`
  - `x`: Column position (0-11) - scaled from 20-col grid
  - `y`: Row position (unchanged)
  - `w`: Width in columns (1-12) - scaled from 20-col grid
  - `h`: Height in rows (unchanged)

## Conversion Process

### 1. Position Scaling (x coordinate)

```javascript
function scalePosition20to12(value) {
  return Math.round((value / 20) * 12);
}
```

**Examples:**
- `x = 0` (20-grid) → `x = 0` (12-grid) - left edge
- `x = 5` (20-grid) → `x = 3` (12-grid) - 25% from left
- `x = 10` (20-grid) → `x = 6` (12-grid) - 50% from left
- `x = 15` (20-grid) → `x = 9` (12-grid) - 75% from left

### 2. Width Scaling (w dimension)

```javascript
function scaleWidth20to12(value) {
  const scaled = Math.round((value / 20) * 12);
  return Math.max(1, Math.min(12, scaled)); // Min 1, max 12
}
```

**Examples:**
- `w = 5` (20-grid) → `w = 3` (12-grid) - 25% width
- `w = 10` (20-grid) → `w = 6` (12-grid) - 50% width
- `w = 15` (20-grid) → `w = 9` (12-grid) - 75% width
- `w = 20` (20-grid) → `w = 12` (12-grid) - 100% width

### 3. Height & Y Position (unchanged)

The y position and height (h) are passed through unchanged since React Grid Layout uses the same row system.

## Component Constraints

The system enforces minimum and maximum dimensions based on component type:

### Minimum Dimensions

```javascript
// Bar charts need more space
SimpleBarChart: { minW: 6, minH: 13 }

// Other charts
SimpleLineChart, SimplePieChart, etc.: { minW: 3, minH: 6 }

// Tables and lists
SimpleTable, SimpleBadgeList: { minW: 3, minH: 5 }

// Metric cards (smallest)
SimpleMetricCard, SimpleKPICard: { minW: 2, minH: 3 }
```

### Maximum Dimensions

Metric card components are constrained to never exceed 25% width:

```javascript
maxW: 3 // 3 columns out of 12 = 25%
```

## Example Conversion

### Input (AI Response)

```json
{
  "layout": { "columns": 20, "rows": 30 },
  "widgets": [
    {
      "id": "widget-1",
      "type": "metric",
      "title": "Total Users",
      "value": "1,234",
      "position": { "x": 0, "y": 0, "w": 5, "h": 4 }
    },
    {
      "id": "widget-2",
      "type": "bar_chart",
      "title": "Revenue",
      "position": { "x": 0, "y": 4, "w": 20, "h": 15 }
    }
  ]
}
```

### Output (React Grid Layout)

```javascript
[
  {
    i: "widget-1",
    x: 0,      // 0 / 20 * 12 = 0
    y: 0,      // unchanged
    w: 3,      // 5 / 20 * 12 = 3
    h: 4,      // unchanged
    minW: 2,
    minH: 3,
    maxW: 3,   // metric card constraint
    component: "SimpleMetricCard",
    props: { title: "Total Users", value: "1,234" }
  },
  {
    i: "widget-2",
    x: 0,      // 0 / 20 * 12 = 0
    y: 4,      // unchanged
    w: 12,     // 20 / 20 * 12 = 12
    h: 15,     // unchanged
    minW: 6,
    minH: 13,
    maxW: undefined,
    component: "SimpleBarChart",
    props: { title: "Revenue", dataPoints: 7 }
  }
]
```

## Testing

To test the conversion, create a mock AI response and verify:

```javascript
import { mapWidgets } from './widget-mapper.js';
import { generateLayout } from './layout-generator.js';

const aiResponse = {
  layout: { columns: 20, rows: 30 },
  widgets: [
    { id: 'w1', type: 'metric', position: { x: 0, y: 0, w: 5, h: 4 } },
    { id: 'w2', type: 'metric', position: { x: 5, y: 0, w: 5, h: 4 } }
  ]
};

const mapped = mapWidgets(aiResponse.widgets);
const layout = generateLayout(mapped, aiResponse.layout);

// Verify positions don't overlap
// w1: x=0, w=3 → occupies cols 0-2
// w2: x=3, w=3 → occupies cols 3-5
// ✓ No overlap!
```

## Changes Made

### 1. layout-generator.js

**Removed:**
- `getPreferredWidth()` function - AI now provides widths directly
- Template conversion logic
- Complex position calculations

**Added:**
- `scalePosition20to12()` - Convert x positions from 20-col to 12-col
- `scaleWidth20to12()` - Convert widths from 20-col to 12-col
- Validation for x,y,w,h format
- Warning when layout is not 20×30

**Updated:**
- `generateLayout()` - Simplified to use AI coordinates directly
- `optimizeLayout()` - Updated for 12-column grid
- `calculateGridDimensions()` - Always returns 20×30

### 2. widget-mapper.js

**Updated:**
- Position default changed from `{ row, col, width, height }` to `{ x: 0, y: 0, w: 5, h: 4 }`
- Added comment explaining x,y,w,h format

## Key Benefits

1. **Simpler Code**: Removed complex width preference logic
2. **Direct Mapping**: AI coordinates map directly to layout
3. **No Guesswork**: AI determines optimal widget sizes
4. **Precise Control**: 20-column grid gives AI fine-grained positioning
5. **No Overlaps**: Proper scaling prevents position conflicts

## Troubleshooting

### Overlaps Detected

If overlaps are detected, check:
1. AI is using 20×30 grid system
2. Widget positions don't overlap in 20-column grid
3. Scaling math is correct: `(value / 20) * 12`

### Widgets Too Small/Large

Check:
1. AI is providing reasonable w and h values
2. Minimum dimension constraints are appropriate
3. maxW constraint isn't too restrictive for metric cards

### Layout Doesn't Match Design

Verify:
1. AI analysis used correct column count (20)
2. Widget positions are in correct format (x,y,w,h not row,col)
3. Scaling functions are being used correctly
