# Code Snippets - Widget Width Constraints

## 1. AI Prompt Addition (claude-analyzer.js)

### Location: After line 86 (after Tables section)

```javascript
🚨 CRITICAL WIDTH CONSTRAINTS 🚨

MAXIMUM WIDTHS BY WIDGET CATEGORY - NEVER EXCEED THESE:

SMALL WIDGETS (Metric/KPI/Summary/Score Cards):
- kpi, kpi_card: w=4 to w=7 MAX (20-35% width)
- metric, metric_card: w=4 to w=7 MAX (20-35% width)
- score, score_card: w=4 to w=7 MAX (20-35% width)
- comparison, comparison_card: w=4 to w=7 MAX (20-35% width)
- status_card (single): w=4 to w=7 MAX (20-35% width)
⚠️ NEVER assign w=20 to these small card widgets!
⚠️ If you see only 1-3 metric cards, use w=5 to w=7 (25-35%)
⚠️ If you see 4-5 metric cards in a row, use w=4 to w=5 (20-25%)

MEDIUM WIDGETS (Charts):
- line_chart, area_chart: w=10 to w=12 (50-60% width) for side-by-side
- pie_chart, donut_chart: w=10 to w=12 (50-60% width) for side-by-side
- gauge, gauge_chart: w=10 to w=12 (50-60% width) for side-by-side
- Or w=20 (100% width) for full-width charts

LARGE WIDGETS (Bar Charts, Lists, Tables):
- bar_chart, column_chart: w=15 to w=20 (75-100% width)
- status_list (multi-item): w=10 to w=20 (50-100% width)
- table, data_table: w=15 to w=20 (75-100% width)
- timeline: w=15 to w=20 (75-100% width)

EXAMPLES OF CORRECT WIDTHS:
✓ Single metric card: w=5 (25% width)
✓ Two metric cards: w=10 each (50% width each)
✓ Three metric cards: w=6 or w=7 each (30-35% width each)
✓ Four metric cards: w=5 each (25% width each)
✓ Five metric cards: w=4 each (20% width each)
✗ WRONG: Single metric card with w=20 (100% width) - TOO WIDE!
✗ WRONG: Metric card with w=15 (75% width) - TOO WIDE!
```

## 2. Validation Function (widget-mapper.js)

### Location: After mapWidgets function, before extractProps function

```javascript
/**
 * Validates and corrects widget width based on widget type
 * Enforces maximum width constraints for small widgets (metric/KPI cards)
 * @param {string} widgetType - The widget type from Claude analysis
 * @param {Object} position - Position object with x, y, w, h
 * @param {string} widgetId - Widget ID for logging
 * @returns {Object} Validated position object
 */
function validateWidgetWidth(widgetType, position, widgetId) {
  const MAX_SMALL_WIDGET_WIDTH = 7; // 35% width maximum
  const DEFAULT_SMALL_WIDGET_WIDTH = 5; // 25% width default

  // Define small widget types that should never exceed 35% width
  const smallWidgetTypes = [
    'kpi',
    'kpi_card',
    'metric',
    'metric_card',
    'score',
    'score_card',
    'comparison',
    'comparison_card',
    'status_card', // Single status card (not multi-item list)
  ];

  // Check if this is a small widget type
  const isSmallWidget = smallWidgetTypes.includes(widgetType);

  // If it's a small widget and width exceeds maximum, correct it
  if (isSmallWidget && position.w > MAX_SMALL_WIDGET_WIDTH) {
    console.warn(
      `⚠️  Widget width corrected: ${widgetId} (${widgetType}) had w=${position.w} (${(position.w / 20 * 100).toFixed(0)}% width), ` +
      `corrected to w=${DEFAULT_SMALL_WIDGET_WIDTH} (${(DEFAULT_SMALL_WIDGET_WIDTH / 20 * 100).toFixed(0)}% width). ` +
      `Small metric/KPI cards should never exceed ${MAX_SMALL_WIDGET_WIDTH} columns (35% width).`
    );

    return {
      ...position,
      w: DEFAULT_SMALL_WIDGET_WIDTH,
    };
  }

  return position;
}
```

## 3. Updated mapWidgets Function (widget-mapper.js)

### Change in mapWidgets function

```javascript
export function mapWidgets(widgets) {
  if (!Array.isArray(widgets)) {
    throw new Error('Widgets must be an array');
  }

  return widgets.map((widget, index) => {
    const componentName = widgetTypeMapping[widget.type] || 'SimpleMetricCard';
    const props = extractProps(widget);
    const position = widget.position || { x: 0, y: 0, w: 5, h: 4 };

    // Validate and correct widget width
    const validatedPosition = validateWidgetWidth(widget.type, position, widget.id || `widget-${index + 1}`);

    return {
      id: widget.id || `widget-${index + 1}`,
      component: componentName,
      position: validatedPosition,  // Use validated position
      props,
      originalType: widget.type,
    };
  });
}
```

## Testing Code

```javascript
import { mapWidgets } from './widget-mapper.js';

// Test: Metric card with wrong width
const testWidgets = [
  {
    id: 'test-1',
    type: 'metric_card',
    title: 'Revenue',
    value: '$125k',
    position: { x: 0, y: 0, w: 20, h: 6 } // WRONG: will be corrected to w=5
  }
];

const result = mapWidgets(testWidgets);
console.log('Result:', result[0].position); // { x: 0, y: 0, w: 5, h: 6 }
```

## Summary

- **AI Instructions**: Prevent incorrect widths at the source
- **Backend Validation**: Catch and correct any mistakes
- **Console Warnings**: Alert developers when corrections happen
- **Type Safety**: Only small widgets are constrained, large widgets unaffected
